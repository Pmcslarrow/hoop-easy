import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase";
import { handleError } from './ErrorHandler';
import { db } from '../config/firebase';
import { updateDoc, collection, Timestamp, doc, getDoc} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL 
} from "firebase/storage";
import { storage } from '../config/firebase';
import { UserContext } from '../App.js'; 
import {Navbar} from './components/Navbar'
import missingPhoto from '../images/missingImage.jpg'


function Profile( props ) {
    const navigate = useNavigate();
    
    const { setAuthenticationStatus } = props
    const [errorStatus, setError] = useState(false);
    const [errorMessage, setMessage] = useState('');
    const [preview, setPreview] = useState("");
    const [profileInformation, setProfileInformation] = useState({})
    const currentUser = useContext(UserContext);
    const userProfileRef = doc(db, `users/${currentUser.id}`);  

    const [refreshData, setRefresh] = useState(0)
    

    useEffect(() => {
        const storageRef = ref(storage,`/files/${currentUser.id}/profilePic`);
        getDownloadURL(storageRef)
          .then((url) => {
            setPreview(url);
          })
          .catch((error) => {
            console.error("Error fetching image: ", error);
          });
    }, []);

    useEffect(() => {

        const updateProfileInformation = async () => {
            getDoc(userProfileRef)
                .then((profileSnapshot) => {
                    if (profileSnapshot.exists()) {
                    const profileInformation = profileSnapshot.data();
                    setProfileInformation(profileInformation)
                    } else {
                    console.log('Document does not exist');
                    }
                })
                .catch((error) => {
                    console.error('Error getting document:', error);
                });
        }

        updateProfileInformation()

    }, [refreshData])

       

    const [formData, setFormData] = useState({
        firstName: currentUser.firstName || '',
        middleInitial: currentUser.middleInitial || '',
        lastName: currentUser.lastName || '',
        username: currentUser.username || '',
        heightFt: currentUser.heightFt || '',
        heightInches: currentUser.heightInches || '',
        weight: currentUser.weight || ''
    });
  
    // Handle form input changes
    const handleInputChange = (e) => {
      const { name, value, type, files } = e.target;
      setFormData({
        ...formData,
        [name]: type === 'file' ? files[0] : value,
      });
    };

    function handleImageUpload(event) {

        const file = event.target.files[0]
        const storageRef = ref(storage,`/files/${currentUser.id}/profilePic`)
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            "state_changed",
            null, 
            (snapshot, error) => {
                console.log(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    alert("Success")
                    setPreview(URL.createObjectURL(file)) 
                });
            }
         );
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      try {
        await updateUserProfile()
      } catch (err) {
        handleError(setError, setMessage, err);
      }
    };
    
  
    const updateUserProfile = async () => {
        try {
          const currentDate = Timestamp.now();
          const { firstName, middleInitial, lastName, username, heightFt, heightInches, weight } = formData;
       
          const updatedFields = {};
          if (firstName !== currentUser.firstName) updatedFields.firstName = firstName;
          if (middleInitial !== currentUser.middleInitial) updatedFields.middleInitial = middleInitial;
          if (lastName !== currentUser.lastName) updatedFields.lastName = lastName;
          if (username !== currentUser.username) updatedFields.username = username;
          if (heightFt !== currentUser.heightFt) updatedFields.heightFt = heightFt;
          if (heightInches !== currentUser.heightInches) updatedFields.heightInches = heightInches;
          if (weight !== currentUser.weight) updatedFields.weight = weight;

          if (Object.keys(updatedFields).length > 0) {
            await updateDoc(userProfileRef, {
              ...updatedFields,
              date: currentDate
            });
            setRefresh(refreshData + 1)
            alert("Success");
          }
        } catch (error) {
          console.error(error);
        }
    };



    const flexRow = { display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }
    const flexCol = {display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}

    const valueData = {}
    if ( formData.weight !== '' ) {
        valueData.weight = formData.weight
    }

    return (
    <>
    <Navbar searchBar={false} setAuthenticationStatus={setAuthenticationStatus} />
    <div style={{...flexRow, height: '90vh'}}>

        <div style={flexCol}>
            <div>
            <img
              src={preview}
              alt={'Profile img'}
              style={{
                borderRadius: '5px',
                overflow: 'hidden',
                width: '275px',
                height: '275px',
                padding: '5px',
                background: `linear-gradient(135deg, rgba(250, 70, 47, 1) 0%, rgba(0, 0, 0, 0.55) 100%)`
              }}
            />
            <div>
                <input type="file" id="imageUpload" name="imageUpload" accept="image/*" onChange={handleImageUpload} />
            </div>
            </div>

            <div>
                <h1 style={{fontFamily: 'var(--font-bold-italic)', fontSize: '4vw', margin: '0', marginTop: '50px'}}>{profileInformation.firstName} {profileInformation.lastName}</h1>
                <h3 style={{fontFamily: 'var(--font-light-italic)', fontSize: '3vw', margin: '0'}}>{currentUser.heightFt}'{profileInformation.heightInches}" {profileInformation.weight}lbs</h3>
            </div>
        </div>

        
        <div>
        <form>
                <div className="form-container">
                <div id="user-input">
                    <span className='flex-row'>
                    <label>
                        First Name
                        <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={handleInputChange}
                        placeholder={currentUser.firstName || ''}
                        maxLength={50}
                        />
                    </label>
                    <label>
                        MI
                        <input
                        type="text"
                        name="middleInitial"
                        id="middleInitial"
                        value={formData.middleInitial || ''}
                        onChange={handleInputChange}
                        placeholder={currentUser.middleInitial || ''}
                        maxLength={1} 
                        />
                    </label>
                    </span>
                    <label>
                    Last Name
                    <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName || ''}
                        onChange={handleInputChange}
                        placeholder={currentUser.lastName || ''}
                        maxLength={50} 
                    />
                    </label>
                    <label>
                    Username
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username || ''}
                        onChange={handleInputChange}
                        placeholder={currentUser.username || ''}
                        maxLength={20} 
                    />
                    </label>
                </div> {/* user-input */}

                <div id='optional'>
                    <span className='flex-col'>
                    <div>
                        <label>
                        Height
                        <span className='flex-row'>
                            <label>
                            <input
                                type="text"
                                name="heightFt"
                                id="heightFt"
                                value={formData.heightFt || ''}
                                onChange={handleInputChange}
                                placeholder={currentUser.heightFt || ''}
                                maxLength={1} 
                            />
                            </label>
                            <label>
                            <input
                                type="text"
                                name="heightInches"
                                id="heightInches"
                                value={formData.heightInches || ''}
                                onChange={handleInputChange}
                                placeholder={currentUser.heightInches || ''}
                                maxLength={1} 
                            />
                            </label>
                        </span>
                        </label>
                        <label>
                        Weight
                        <input
                            type="text"
                            name="weight"
                            id="weight"
                            value={formData.weight ? formData.weight : ''}
                            onChange={handleInputChange}
                            placeholder={currentUser.weight || ''}
                            maxLength={4}
                        />
                        </label>
                    </div>
                    <button type="submit" onClick={handleSubmit} className='buttonStyle'>
                        Update
                    </button>
                    </span>
                </div> { /* Optional */}
                </div> { /* form-container */}

                <p id='error-message'>{errorStatus ? errorMessage : ""}</p>
      </form>
        </div>
     
      </div>
      </>
    );
    
  }



export default Profile