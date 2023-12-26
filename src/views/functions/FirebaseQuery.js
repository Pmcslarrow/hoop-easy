// FirebaseQuery.js
// Instead of reusing the same long ugly lines of firebase queries, I will write all the helper functions here so it is more readable
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'



class FirebaseQuery {
    constructor( auth, db, game, currentuser ) {
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
            return await this.fetchAndMapTeammateData();
        } catch (err) {
            console.log(err);
        }
    }

    async fetchAndMapTeammateData() {
        const docRef = doc(this.db, `Games/${this.game.gamesID}`);
        try {
            const docSnapshot = await getDoc(docRef);
            const teammatesData = docSnapshot.data().teammates;
            return teammatesData ?? [];
        } catch (error) {
            throw error;
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
                const dbDate = new Date(dbData.dateOfGame).getTime();
                const gameDate = new Date(this.game.dateOfGame).getTime();
    
                if (dbData.coordinates._lat === this.game.coordinates._lat &&
                    dbData.coordinates._long === this.game.coordinates._long &&
                    dbDate === gameDate &&
                    dbData.playerID === this.game.playerID) {
                    
                    await deleteDoc(doc.ref);
                    console.log(`Deleted game with ID: ${doc.id}`);
                }
            }
        } catch (error) {
            console.error("Error deleting pending game instance:", error);
        }
    }
    
    // When a game is full add the game instance to each of the teammates confirmed games and then remove the public game posting
    async handleFullGame() {
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

        await this.deletePendingGameInstance();
        await this.deleteGameInstance();
    }
    
    // When a game is empty just remove the public posting of the game and the pending game
    async handleEmptyGame() {
        this.deletePendingGameInstance()
        this.deleteGameInstance()
    }

    async getDataFrom( path, flag ) {
        const collectionRef = collection(this.db, path);
        const docs = await getDocs(collectionRef);

        if ( flag === 0 ) {
            return docs.docs.map((doc) => ({...doc.data(), id: doc.id}));
        } else {
            return docs.docs.map((doc) => ({...doc.data(), id: doc.id, gamesID: doc.id}));
        }
    }

    async getAllUsers() {
        return await this.getDataFrom('users', 0)
    }

    async getCurrentUserData( users ) {
        const currentUser = users.find((user) => user.email === this.auth?.currentUser?.email);
        return currentUser
    }

    async getConfirmedGames( currentUserID ) {
        return await this.getDataFrom(`users/${currentUserID}/confirmedGames`, 0)
    }

    async getPendingGames( currentUserID ) {
        return await this.getDataFrom(`users/${currentUserID}/pendingGames`, 0)
    }

    async getAvailableGames() {
        if (this.auth?.currentUser) {
            const gamesData = await this.getDataFrom('Games', 1)

            let joinedGames = gamesData.map(game => {
                let user = gamesData.find(user => user.id === game.playerID);
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
        return []
    }

}

export { FirebaseQuery }