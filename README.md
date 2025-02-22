# Reunite (Finalist TSEC Hacks🏆)

Reunite is a platform designed to streamline the identification, tracking, and recovery of missing persons and children by leveraging Aadhaar's biometric authentication system. It integrates police, NGOs, and other organizations to enhance the efficiency of search and rescue operations.

## Inspiration
Missing persons and children pose a significant societal challenge. Despite efforts by law enforcement agencies and NGOs, the lack of a centralized system to track and identify individuals in real-time has led to inefficiencies. Reunite addresses this gap by creating a unified platform to enhance search and recovery efforts.

## Features

### 1. User Registration and Authentication
- Integration with Aadhaar for secure identity verification and authentication.
- Users register using their Aadhaar details, ensuring accurate and verified identity records.

### 2. Reporting and Filing Missing Complaints
- Families or users can file a missing complaint with detailed information about the person, including photos and last-known location.
- Complaints are stored in the `Missing People Collection` database.

### 3. Facial Recognition for Identification
- Utilizes DeepFace for facial recognition to compare submitted photos with existing records in the database.
- This feature helps to identify missing persons from sightings reported by users.

### 4. Dynamic Search Area Mapping
- Integrated with Leaflet.js for dynamic mapping of the area where the missing person was last seen or potentially sighted.
- Allows authorities and NGOs to visualize and optimize search operations.

### 5. Reporting Sightings
- Users can report sightings of missing persons directly through the platform by uploading photos or providing location details.
- Photos are matched against the `Missing People Collection` using facial recognition.

### 6. Integration with WhatsApp via Twilio
- Streamlined reporting and tracking by enabling image submissions via WhatsApp.
- Real-time status checks and automated alerts are sent to authorities using Twilio's WhatsApp integration.

### 7. Coordinated Efforts with Authorities and NGOs
- The platform facilitates coordination with police, NGOs, and other organizations for efficient rescue operations.
- Information on sightings is automatically shared with relevant authorities to enhance collaboration.

### 8. Real-Time Status Updates and Notifications
- Users and registered family members receive real-time updates on the status of filed complaints.
- Automated notifications are sent in case of potential matches or new sightings.

### 10. Data Security and Privacy
- End-to-end encryption is implemented for storing personal and biometric data, ensuring user privacy and security.
- **Aadhaar Integration**: Secure identity verification and searching.
- **Facial Recognition**: Matching missing persons with sightings using DeepFace.
- **Dynamic Search Area Mapping**: Optimizing recovery efforts using Leaflet.js.
- **WhatsApp Integration**: Reporting sightings via images and automated alerts using Twilio.
- **User Registration and Reporting**: Families can register missing persons with detailed profiles, and users can report sightings.
- **Integration with Authorities**: Coordinated efforts with police, NGOs, and relevant organizations.
- **End-to-End Encryption**: Ensures secure storage of personal and biometric data.
- **Multilingual Support**: Accessible in multiple Indian languages for diverse users.

## Tech Stack
- **Frontend**: React.js, Leaflet.js, Zustand, Recharts
- **Backend**: Flask-RESTful
- **Database**: SQLite
- **Facial Recognition**: DeepFace
- **Communication**: Twilio (for WhatsApp integration)

## Architecture

<img width="542" alt="image" src="https://github.com/user-attachments/assets/43bdbd75-f47d-4d32-9e57-4163f4b88253" />

The architecture of **Reunite** is designed to streamline the process of reporting, identifying, and tracking missing persons efficiently. It is structured as follows:

1. **User Registration and Login**
   - Users register and log in using their Aadhaar details, which are verified against the `Aadhaar Collection` database for identity authentication.
   - Successful verification leads to account creation in the `User Collection` database.

2. **Filing Missing Complaints**
   - Users can file a missing complaint by providing details and uploading photos of the missing person.
   - This information is stored in the `Missing People Collection` database.

3. **Facial Recognition and Sightings Reporting**
   - Sightings can be reported through photo uploads, which are then matched against the `Missing People Collection` using DeepFace facial recognition.
   - Matches trigger notifications and updates to registered users and authorities.

4. **Information Sharing and Alerts**
   - Sightings are automatically shared with relevant authorities, police, and NGOs for coordinated rescue efforts.
   - Integration with Twilio enables WhatsApp-based image submissions and alerts.

5. **Real-Time Mapping and Tracking**
   - Using Leaflet.js, the platform dynamically maps the last known locations and reported sightings, optimizing search areas for better resource allocation.

6. **Multi-Language Support and Accessibility**
   - The platform provides support for multiple Indian languages, ensuring accessibility and ease of use for diverse users.

7. **Data Security and Privacy**
   - End-to-end encryption is implemented for secure storage of personal and biometric data, maintaining user confidentiality and data integrity. Overview
The architecture involves:
- User registration and login integrated with Aadhaar for secure verification.
- Filing missing complaints, stored in the Missing People Collection.
- Facial recognition searches using camera inputs or uploaded images.
- Sightings reported via WhatsApp are directly sent to authorities and NGOs.

## Installation and Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/rushiijadhav23/Renuite-TSEC.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Renuite-TSEC
    ```
3. Install frontend dependencies:
    ```bash
    cd client
    npm install
    ```
4. Install backend dependencies:
    ```bash
    cd ../apis
    pip install -r requirements.txt
    ```
5. Run the development servers:
    ```bash
    npm run dev    # React Frontend
    python app.py    # Flask Backend
    ```
6. Add Your Twilio credentials
7. Make Sure to run the backend on Ngrok, which will be required for Twilio Integration.

## Achievements
- Finalist (Top 12) at **TSEC Hacks 2025** - Thadomal Sahani Engineering College, Bandra.

## Acknowledgements
- **TSEC CodeCell** for organizing TSEC Hacks 2025.
- Team members and mentors for their guidance and support.
