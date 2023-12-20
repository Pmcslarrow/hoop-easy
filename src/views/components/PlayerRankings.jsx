import { useState, useEffect } from 'react';
import { Navbar } from "./Navbar";
import { getDocs, collection } from 'firebase/firestore'
import { auth, db } from '../../config/firebase';
import '../homepage.css'

const Leaderboard = ({ currentUser }) => {
    const [data, setData] = useState([]);
    const [sortOrder, setSortOrder] = useState(false)

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

     const handleSort = () => {
        setSortOrder(!sortOrder)
     }

     const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed' 
    };

    const tableHeaderStyle = {
        fontSize: '18px',
        textAlign: 'left',
        width: '25%',
        fontFamily: 'var(--font-bold-italic)'
    };

    const tableCellStyle = {
        paddingTop: '10px',
        paddingBottom: '10px',
        fontSize: '18px',
        width: '25%'
    };
     
    const container = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh', 
        paddingLeft: '10%',
        paddingRight: '10%',
    }

    const captionStyling = {
        textAlign: 'left', 
        fontSize: '2rem', 
        fontFamily: 'var(--font-bold-italic)',
        paddingBottom: '50px'
    }

    const upArrow = '▲'
    const downArrow = '▼'

    
    return (
        <div style={container}>
            <table style={tableStyle}>
                <caption style={captionStyling}>Rankings</caption>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th onClick={handleSort} id='rank'>Rank {sortOrder ? downArrow : upArrow }</th>
                        <th>Overall</th>
                        <th>Username</th>
                        <th>Games Played</th>
                    </tr>
                </thead>
                <tbody>
                    {sortOrder 
                        ? data.slice(0).reverse().map((row, index) => ( 
                            <tr key={index}>
                                <td style={tableCellStyle}>
                                    {data.length - index}
                                </td>
                                <td style={tableCellStyle}>{row.overall}</td>
                                <td style={tableCellStyle}>{row.username}</td>
                                <td style={tableCellStyle}>{row.gamesPlayed}</td>
                            </tr>
                        ))
                        : data.map((row, index) => (
                            <tr key={index}>
                                <td style={tableCellStyle}>
                                    {index + 1}
                                </td>
                                <td style={tableCellStyle}>{row.overall}</td>
                                <td style={tableCellStyle}>{row.username}</td>
                                <td style={tableCellStyle}>{row.gamesPlayed}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
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
