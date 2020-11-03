
import { FIREBASE_ADMIN } from '@root/config';
import { FirestoreCollections } from '@lib/types/Types';
import * as firebase from 'firebase-admin';

if (FIREBASE_ADMIN) {
	firebase.initializeApp({
		credential: firebase.credential.cert({
			privateKey: FIREBASE_ADMIN.private_key,
			clientEmail: FIREBASE_ADMIN.client_email,
			projectId: FIREBASE_ADMIN.project_id
		})
	});
}

const db = firebase.firestore();


export class FirestoreManager {

	public async hasCollection(firestoreCollection: FirestoreCollections) {
		const firestoreData = await db.collection(firestoreCollection).get();

		return Boolean(firestoreData.size);
	}

	public async getDocs(firestoreCollection: FirestoreCollections) {
		const firestoreData = await db.collection(firestoreCollection).get();

		return firestoreData.docs.map(snap => snap.id);
	}

	public async get(firestoreCollection: FirestoreCollections, firestoreDoc: string) {
		const firestoreData = await db.collection(firestoreCollection).doc(firestoreDoc).get();

		return this.packData(firestoreData.data(), firestoreData.id);
	}

	public async has(firestoreCollection: FirestoreCollections, firestoreDoc: string) {
		const firestoreData = await db.collection(firestoreCollection).doc(firestoreDoc).get();

		return firestoreData.exists;
	}

	public async set(firestoreCollection: FirestoreCollections, firestoreDoc: string, data: Record<string, unknown>) {
		const firestoreData = await db.collection(firestoreCollection).doc(firestoreDoc).set(data);

		return firestoreData;
	}

	public async update(firestoreCollection: FirestoreCollections, firestoreDoc: string, data: Record<string, unknown>) {
		const firestoreData = await db.collection(firestoreCollection).doc(firestoreDoc).update(data);

		return firestoreData;
	}

	public async delete(firestoreCollection: FirestoreCollections, firestoreDoc: string) {
		const firestoreData = await db.collection(firestoreCollection).doc(firestoreDoc).delete();

		return firestoreData;
	}

	private packData(data: any, id: string) {
		return {
			...data,
			id
		};
	}

}
