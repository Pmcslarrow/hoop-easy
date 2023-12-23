import { Navbar } from './Navbar'
import { useState } from 'react'
import '../styling/FindGamePage.css'

const generateFakeData = () => {
    const data = [];
    const addresses = [
        '123 Main St, City, Country',
        '456 Elm St, Town, Country',
        '789 Pine St, Village, Country',
        '101 Oak St, Hamlet, Country',
        '202 Maple St, Suburb, Country'
    ];

    for (let i = 1; i <= 10; i++) {
        const currentCard = {
            id: i,
            distance: Math.random() * 50, // Random distance up to 50 miles
            trimmedDateOfGame: `12/${Math.floor(Math.random() * 30) + 1}`, // Random day of the month
            trimmedTimeOfGame: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60)}`, // Random time
            username: `User${i}`,
            heightFt: Math.floor(Math.random() * 7) + 5, // Random height between 5' and 7'
            heightInches: Math.floor(Math.random() * 12), // Random inches between 0 and 11
            overall: Math.floor(Math.random() * 100), // Random overall rating up to 100
            addressString: addresses[Math.floor(Math.random() * addresses.length)] // Random address from the list
        };

        data.push(currentCard);
    }

    return data;
};

const Card = ({ item }) => {
    const [opacity, setOpacity] = useState(0)

    const hover = () => {
        if ( opacity === 0 ) {
            setOpacity(1)
        } else {
            setOpacity(0)
        }
    }


    console.log(item);
    return (
        <div>
            <div id='card-outer' onMouseEnter={hover} onMouseLeave={hover}>
                <div>
                    <span className="card-text" style={{opacity: opacity === 0 ? 1 : 0}}></span>
                    <span className='accept-text' style={{opacity: opacity === 0 ? 0 : 1}}>ACCEPT</span>
                </div>
            </div>
            <div id='subtext'>
                <div id='subtext-left'>
                    <h4>Pmcslarrow</h4>
                    <p>3162 East Eagle View Circle</p>
                    <p>11.10 3pm</p>
                </div>
                <div id='subtext-right'>
                    <p>67 Overall</p>
                    <p></p>
                    <p>4.82 Miles</p>
                </div>
            </div>
        </div>
    );
};



function FindGamePage() {

    const data = generateFakeData();
    return (
        <section className="card-container">
            <Navbar />
            <div id='card-container'>
                {data.map(item => (
                    <Card 
                        key={item.id}
                        item={item}
                    />
                ))}
            </div>

        </section>
    );
}
export default FindGamePage