import { useState, useEffect } from 'react';
import { Navbar } from "./Navbar";
import { getDocs, collection } from 'firebase/firestore'
import { auth, db } from '../../config/firebase';


const Leaderboard = ({ currentUser }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchGameHistory = async () => {
            const usersCollectionPath = `users/`
            const ref = collection(db, usersCollectionPath)
            const userSnapshot = await getDocs(ref);
            const users = userSnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));

            users.forEach((user) => {console.log(user)})

            const data = users.map(obj => ({
                username: obj.username,
                overall: obj.overall,
                gamesPlayed: obj.gamesPlayed
            }));

            data.sort((a, b) =>  parseFloat(b.overall) - parseFloat(a.overall));

            console.log(data)
            setData(data)
        }
        fetchGameHistory()
     }, [])
     
    const tableHeaderStyle = {
        fontSize: '25px',
        textAlign: 'left',
    };
    const tableCellStyle = {
        border: '1px solid rgba(255, 255, 255, 0.5)',
        padding: '10px',
        fontSize: '18px',
    };

    const container = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', 
        paddingLeft: '10%',
        paddingRight: '10%',
    }


    return (
        <div style={container}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Overall</th>
                        <th>Games Played</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => ( 
                        <tr key={index} style={{ border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                            <td style={tableCellStyle}>
                                {index + 1}
                            </td>
                            <td style={{ ...tableCellStyle, height: '50px' }}>{row.username}</td>
                            <td style={tableCellStyle}>{row.overall}</td>
                            <td style={tableCellStyle}>{row.gamesPlayed}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function PlayerRankings(props) {
    const { currentUser } = props

    return (
        <>
            <Navbar />
            <Leaderboard currentUser={currentUser}/>
        </>
    )
}

export default PlayerRankings;
