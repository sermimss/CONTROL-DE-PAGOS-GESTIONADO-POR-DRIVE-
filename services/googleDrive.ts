// @ts-nocheck - Google APIs are loaded from a script tag and not available as modules

import { Student, Payment } from '../types';

// --- ATENCIÓN ---
// REEMPLAZA ESTOS VALORES CON TUS PROPIAS CREDENCIALES DE GOOGLE CLOUD
// 1. Ve a https://console.cloud.google.com/
// 2. Crea un nuevo proyecto.
// 3. Ve a "APIs y servicios" > "Credenciales".
// 4. Crea un "ID de cliente de OAuth 2.0" de tipo "Aplicación web".
//    - En "Orígenes de JavaScript autorizados", añade la URL donde se ejecutará tu app.
//    - En "URIs de redireccionamiento autorizados", añade la URL también.
// 5. Crea una "Clave de API".
// 6. Habilita la "API de Google Drive" en la biblioteca de APIs.
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'; // Pega tu Client ID aquí
const API_KEY = 'YOUR_API_KEY'; // Pega tu API Key aquí
// --- --- --- ---

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DATA_FILE_NAME = 'pagos_alumnos_data_v1.json';

export interface GoogleDriveUser {
    name: string;
    email: string;
    picture: string;
}

interface AppData {
    students: Student[];
    payments: Payment[];
}

class GoogleDriveService {
    private gapi: any;
    private gis: any;
    private tokenClient: any;
    private fileId: string | null = null;
    private isGapiLoaded = false;
    private isGisLoaded = false;
    
    constructor() {
        // La inicialización se difiere a initClient
    }

    private async loadGapi() {
        return new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                this.gapi = window.gapi;
                this.isGapiLoaded = true;
                resolve();
            };
            document.body.appendChild(script);
        });
    }

    private async loadGis() {
        return new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
                this.gis = window.google.accounts;
                this.isGisLoaded = true;
                resolve();
            };
            document.body.appendChild(script);
        });
    }

    async initClient(callback: (token: any) => void) {
        if (!this.isGapiLoaded) await this.loadGapi();
        if (!this.isGisLoaded) await this.loadGis();
        
        if (CLIENT_ID.startsWith('YOUR_CLIENT_ID')) {
             console.warn("Google Drive no funcionará hasta que se configuren el CLIENT_ID y la API_KEY en services/googleDrive.ts");
             return;
        }

        await new Promise<void>((resolve, reject) => {
            this.gapi.load('client', {
                callback: async () => {
                    await this.gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                    });
                    this.tokenClient = this.gis.oauth2.initTokenClient({
                        client_id: CLIENT_ID,
                        scope: SCOPES,
                        callback: (tokenResponse) => {
                            // Si hay un error, el token puede ser inválido
                            if (tokenResponse.error) {
                                console.error('Token error:', tokenResponse.error);
                            }
                            callback(tokenResponse);
                        },
                    });
                    resolve();
                },
                onerror: reject,
            });
        });
    }

    async signIn() {
       if (!this.tokenClient) {
            alert('El cliente de Google no se ha inicializado. Revisa las credenciales de la API.');
            return;
       }
        return new Promise<void>((resolve) => {
            if (this.gapi.client.getToken() === null) {
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                this.tokenClient.requestAccessToken({ prompt: '' });
            }
            // El callback en initClient maneja la respuesta
            resolve();
        });
    }

    async signOut() {
        const token = this.gapi.client.getToken();
        if (token !== null) {
            this.gis.oauth2.revoke(token.access_token, () => {
                this.gapi.client.setToken('');
                this.fileId = null;
            });
        }
    }

    getSignedInUser(): GoogleDriveUser | null {
        if(!this.gapi || !this.gapi.client || !this.gis) return null;
        
        const token = this.gapi.client.getToken();
        if (!token) return null;
        
        try {
            // Decodificar el JWT del id_token para obtener la información del perfil
            const idToken = token.id_token;
            if (!idToken) return null;
            
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const claims = JSON.parse(jsonPayload);
            return {
                name: claims.name,
                email: claims.email,
                picture: claims.picture,
            };
        } catch (e) {
            console.error("Error decoding JWT", e);
            return null;
        }
    }
    
    private async findFile(): Promise<string | null> {
        if (this.fileId) return this.fileId;
        
        try {
            const response = await this.gapi.client.drive.files.list({
                q: `name='${DATA_FILE_NAME}' and 'appDataFolder' in parents and trashed=false`,
                spaces: 'appDataFolder',
                fields: 'files(id)',
            });
            if (response.result.files && response.result.files.length > 0) {
                this.fileId = response.result.files[0].id;
                return this.fileId;
            }
            return null;
        } catch (error) {
            console.error('Error finding file', error);
            return null;
        }
    }

    private async createFile(initialData: AppData): Promise<string | null> {
        try {
            const response = await this.gapi.client.drive.files.create({
                resource: {
                    name: DATA_FILE_NAME,
                    parents: ['appDataFolder']
                },
                media: {
                    mimeType: 'application/json',
                    body: JSON.stringify(initialData)
                },
                fields: 'id'
            });
            this.fileId = response.result.id;
            return this.fileId;
        } catch (error) {
            console.error('Error creating file', error);
            return null;
        }
    }

    async loadData(): Promise<AppData> {
        const fileId = await this.findFile();
        if (!fileId) {
            // Si el archivo no existe, creamos uno con datos iniciales vacíos
            await this.createFile({ students: [], payments: [] });
            return { students: [], payments: [] };
        }
        try {
            const response = await this.gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            // Si el archivo está vacío, devuelve la estructura por defecto
            if (!response.body) return { students: [], payments: [] };
            return JSON.parse(response.body);
        } catch (error) {
            console.error('Error loading data', error);
            return { students: [], payments: [] };
        }
    }

    async saveData(data: AppData) {
        let fileId = await this.findFile();
        if (!fileId) {
            fileId = await this.createFile(data);
            if (!fileId) {
                 throw new Error("Could not find or create data file in Google Drive.");
            }
            return; // Ya se guardó al crear
        }

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const metadata = {
            'mimeType': 'application/json',
        };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(data) +
            close_delim;

        try {
            await this.gapi.client.request({
                path: `/upload/drive/v3/files/${fileId}`,
                method: 'PATCH',
                params: { uploadType: 'multipart' },
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            });
        } catch (error) {
            console.error('Error saving data', error);
            throw error;
        }
    }
}

const driveService = new GoogleDriveService();
export default driveService;