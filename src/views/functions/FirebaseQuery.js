// FirebaseQuery.js
// Instead of reusing the same long ugly lines of firebase queries, I will write all the helper functions here so it is more readable
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'

class FirebaseQuery {
    constructor(game, currentuser) {
        this.auth = auth
        this.db = db;
        this.game = game;
        this.currentuser = currentuser;
        this.teammatesIdArray = [];

        if (game) {
            this.MAX = parseInt(game.gameType) * 2;
        }
    }


    async joinGame() {
        return await this.addCurrentUserToTeammateCollection()
    }

    async leaveGame() {
        return await this.removeCurrentUserFromTeammateCollection()
    }

    async addCurrentUserToTeammateCollection() {
        const docRef = doc(this.db, `Games/${this.game.gamesID}`);
        try {
            let teammates = await this.getTeammateIdArray()
            teammates.push(this.currentuser.id)
            this.teammatesIdArray = teammates
            await updateDoc(docRef, { teammates : teammates })
            console.log("Success adding current user to teammate collection")
            return teammates
        } catch (error) {
            throw error;
        }
    }

    async removeCurrentUserFromTeammateCollection() {
        const docRef = doc(this.db, `Games/${this.game.gamesID}`);
        try {
            const docSnapshot = await getDoc(docRef);
            const teammatesData = docSnapshot.data().teammates;    
            const updatedTeammatesData = teammatesData.filter(teammate => teammate !== this.currentuser.id); 
            this.teammatesIdArray = updatedTeammatesData;  

            await updateDoc(docRef, { teammates: updatedTeammatesData });
            console.log("Successfully removed current user from teammate collection")

            return updatedTeammatesData
        } catch (error) {
            throw error;
        }
    }

    async getTeammateIdArray() {
        try {
            return await this.getTeammatesFromGameInstance();
        } catch (err) {
            console.log(err);
        }
    }

    async getTeammatesFromGameInstance() {
        const docRef = doc(this.db, `Games/${this.game.gamesID}`);
        try {
            const docSnapshot = await getDoc(docRef);
            const teammatesData = docSnapshot.data().teammates;
            return teammatesData ?? [];
        } catch (error) {
            throw error;
        }
    }

    documentMatchesGame(documentData) {
        return ( 
            documentData.coordinates._lat === this.game.coordinates._lat &&
            documentData.coordinates._long === this.game.coordinates._long &&
            documentData.dateOfGame === this.game.dateOfGame &&
            documentData.playerID === this.game.playerID
        )
    }
    
    async handleFullGame() {
        await this.addGameToEachPlayersConfirmedGames()
        await this.deletePendingGameInstance();
        await this.deleteGameInstance();
    }

    async handleEmptyGame() {
        this.deletePendingGameInstance()
        this.deleteGameInstance()
    }

    async addGameToEachPlayersConfirmedGames() {
        for (const userID of this.teammatesIdArray) {
            const confirmedGamePath = `users/${userID}/confirmedGames`;
            const collectionRef = collection(this.db, confirmedGamePath);
            this.game.teammates = this.teammatesIdArray
            
            try {
                await addDoc(collectionRef, this.game);
            } catch (err) {
                console.log(err);
            }
        }
    }
    
    async deleteGameInstance() {
        try {
            const collectionRef = collection(this.db, 'Games');            
            const querySnapshot = await getDocs(collectionRef);            
            querySnapshot.forEach(async (doc) => {
                if (doc.id === this.game.gamesID) {
                    await deleteDoc(doc.ref);
                }
            });
            console.log("Successfully deleted game instance with ID:", this.game.gamesID);
        } catch (err) {
            console.log("Error deleting game instance:", err);
        }
    }
    
    async deletePendingGameInstance() {
        const pendingGamePath = `users/${this.game.playerID}/pendingGames`;
        const collectionRef = collection(this.db, pendingGamePath);
    
        try {
            const querySnapshot = await getDocs(collectionRef);
    
            for (const doc of querySnapshot.docs) {
                const dbData = doc.data(); 
                this.updateObjectField(dbData.dateOfGame, new Date(dbData.dateOfGame).getTime())
                this.updateObjectField(this.game.dateOfGame, new Date(this.game.dateOfGame).getTime())

                
                if (this.documentMatchesGame(dbData)) {
                    await deleteDoc(doc.ref)
                    console.log(`Deleted game with ID: ${doc.id}`);
                }
            }
        } catch (error) {
            console.error("Error deleting pending game instance:", error);
        }
    }

    async getDataFromCollection(path) {
        const collectionRef = collection(this.db, path);
        const docs = await getDocs(collectionRef);
        return docs.docs.map((doc) => ({...doc.data(), id: doc.id, gamesID: doc.id}));
    }

    async getDataFromDoc(path) {
        const docRef = doc(this.db, path);
        const document = await getDoc(docRef);
        return {...document.data(), id: document.id, gamesID: document.id}
    }

    async getAllUsers() {
        return await this.getDataFromCollection('users')
    }

    async getCurrentUserData(users) {
        const currentUser = users.find((user) => user.email === this.auth?.currentUser?.email);
        return currentUser
    }

    async getConfirmedGames(currentUserID) {
        return await this.getDataFromCollection(`users/${currentUserID}/confirmedGames`)
    }

    async getPendingGames(currentUserID) {
        return await this.getDataFromCollection(`users/${currentUserID}/pendingGames`)
    }

    async getAvailableGames() {
        if (this.isUserLoggedIn()) {
            const gamesData = await this.getDataFromCollection('Games');
            const gamesWithoutCurrentUser = this.getGamesWithoutUser( gamesData );
            return gamesWithoutCurrentUser
        }
        return []
    }

    async getTeammateProfiles(teammateIDArray) {
        const profiles = [];
        for (const userID of teammateIDArray) {
          const profile = await this.getDataFromDoc(`users/${userID}`);
          profiles.push(profile);
        }
        return profiles;
      }

    isUserLoggedIn() {
        return this.auth?.currentUser
    }

    getGamesWithoutUser(games) {
        let joinedGames = games.map(game => {
            let user = games.find(user => user.id === game.playerID);
            if (user && user.email !== this.auth?.currentUser?.email) {
                return {
                    ...game,
                    ...user
                }
            }
            return null
        }).filter(game => game !== null);   
        
        return joinedGames
    }
}

export { FirebaseQuery }