<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a>
    <img src="hoop-easy-client/src/assets/images/hoop-easy.png" alt="Logo" width="250px" height="125px">
  </a>

  <p align="center">
    An application built to make finding and playing pickup basketball games, easy. 
    <br />
    ·
    <a href="https://github.com/Pmcslarrow/hoop-easy/issues">Report Bug / Request Feature</a>
    ·
    <a href="https://hoop-easy-client-production.up.railway.app/">Website (currently down for maintenance)</a>
  </p>
</div>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![MIT License][license-shield]][license-url]




<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#user-guide">User's Guide</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

HoopEasy is an application created to make finding pickup basketball games easy and fun. The app uses geocoding to calculate the distance of games from your location, and utlizes the Google Maps API to help setup and find games where you desire. We use an ELO rating system in which affects the overall rating of a player after each game played. 

In the near future we plan on creating an in-app marketplace for leveling up your character as you play. As you begin to play more games we we attempt to increase your XP level and separately your overall rating based on wins. Each will help generate an in-app currency that can be exchanged to personalize your experience!

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

[![React.js](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebasedotgoogle&logoColor=white)](https://firebase.google.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysqldotcom&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)



<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USERS GUIDE -->
## User Guide

#### Creating an Account
When you load into HoopEasy you should see the following page:
<img width="1394" alt="Screenshot 2024-03-19 at 9 39 16 AM" src="https://github.com/Pmcslarrow/hoop-easy/assets/74205136/ddd46357-f563-4567-af40-5f23b3cf015f">
Click on the "Create Account" button and it will take you through the process of necessary user inputs. Height and weight are optional parameters that can be changed later on. 

#### Verifying your email and Logging In
We utilize Google Firebase to help secure your account well, and you will receive an email containing a link to verify your email. Once you click the link, make way back to the application as it should have redirected to the login page where you can now try your new login.

#### Understanding the homepage
The homepage is where you as the user can get started with finding or creating new games. At the very top you have the HoopEasy logo which you can click to go back a page always, a profile page to update your user's information, and a navigation bar that will help you get to places like the rankings or finding a game page. 

Lower on the page, you have the "My Games" section. At the creation of your account this will be empty, but as you create games, or join other games, this is the hub you will use to see upcoming games, or where you can verify the end result of games. Going further into this process, the most user intensive process is when verifying a game. Let's say that you have two players, yourself and a stranger who played 1v1 one day. If you want to submit a score, the card will show your game and the button "submit score". You click this process to go through the process of selecting the two team captains who must verify (accept) the game's score is accurate and then this will trigger the ELO rating algorithm. 

<img width="1204" alt="Screenshot 2024-03-19 at 9 44 22 AM" src="https://github.com/Pmcslarrow/hoop-easy/assets/74205136/e28ed5a4-e488-4733-bce4-10ae36a68ecd">

#### Creating a game
To create a game, click the "+" icon at the bottom right of the homepage. You will get a form that uses the familiar feeling Google Maps API to search for an address that you want to use (the location of the game), select the time and date of this game, and the type of game you are wanting to play (1v1, 2v2...5v5).

<img width="607" alt="Screenshot 2024-03-19 at 9 59 48 AM" src="https://github.com/Pmcslarrow/hoop-easy/assets/74205136/ef83d1d5-a5e4-4eff-a81c-08d253c98ec9">

#### Finding a game
To find a game, you can either click the first circle on the top of the homepage, or you can go to the top right of your screen to the navigation bar and go to "FIND A GAME". This page will have a very similar UI as the My Games cards, but the card should show the number of players that are in the game, and the slots left. You can both leave games and join games if need be. 

<img width="383" alt="Screenshot 2024-03-19 at 10 01 27 AM" src="https://github.com/Pmcslarrow/hoop-easy/assets/74205136/29f1de29-c571-46ea-b9bc-630284ee9b67">

#### Looking at global rankings
To look at the global rankings, go to the navigation bar and click "RANKINGS". 
<img width="920" alt="Screenshot 2024-03-19 at 10 01 51 AM" src="https://github.com/Pmcslarrow/hoop-easy/assets/74205136/81ebe44d-10c8-487b-bfdf-396388f68ae0">

#### Updating your profile
To update any information about your profile like your first name, last name, middle initial (MI), username, height, and weight. Soon will work on adding a system that works with profile pictures.

<img width="1167" alt="Screenshot 2024-03-19 at 10 02 08 AM" src="https://github.com/Pmcslarrow/hoop-easy/assets/74205136/759e1e12-2815-4956-809b-1850c2261563">

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [ ] Creating a map to see games and find games
- [ ] Creating a groups section for consistent teams that play looking for other teams to challenge
- [ ] XP Bar and Gamifying HoopEasy to rank up a player's XP no matter a win/ loss (different from your overall rating).
- [ ] An in-app marketplace that you can redeem points for the XP earned over time to purchase things to customize your character / page. 

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

<b>Developer</b> -- Paul McSlarrow -- pmcslarrow@icloud.com
<b>UI Design</b> -- Sarah Smith -- sarahjeansmith014@gmail.com 
<b>Business Administration</b> -- Jack Boydell-- jacboydell@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
