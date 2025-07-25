
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBVEKPE3eHUf5oYf5QN7O6y60FRXp4lvig",
            authDomain: "gov-doc--system.firebaseapp.com",
            projectId: "gov-doc--system",
            storageBucket: "gov-doc--system.firebasestorage.app",
            messagingSenderId: "481808708152",
            appId: "1:481808708152:web:55a774cee1805ee044eccd"
        };

        // Initialize Firebase
        const firebaseApp = firebase.initializeApp(firebaseConfig);
        const db = firebaseApp.firestore();
        const auth = firebaseApp.auth();
        const storage = firebase.storage();

        // Global variables
        let otpSent = false;
        const DEMO_OTP = "123456";

        // Page navigation
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
        }

        // Send OTP (Demo version)
        function sendOTP() {
            const phoneNumber = document.getElementById('phonenum').value;
            
            if (!phoneNumber || phoneNumber.length !== 10) {
                showMessage('otp-message', 'Please enter a valid 10-digit phone number', 'error');
                return;
            }

            // Simulate OTP sending
            otpSent = true;
            showMessage('otp-message', 'Demo OTP sent! Use: 123456', 'success');
        }

        // Verify OTP (Demo version)
        function verifyOTP() {
            const otpCode = document.getElementById('otp').value;
            const phoneNumber = document.getElementById('phonenum').value;
            
            if (!otpSent) {
                showMessage('otp-message', 'Please send OTP first', 'error');
                return;
            }

            if (!otpCode) {
                showMessage('otp-message', 'Please enter the OTP', 'error');
                return;
            }

            if (otpCode === DEMO_OTP) {
                showMessage('otp-message', 'OTP verified successfully!', 'success');
                
                // Store phone number in local storage for demo
                localStorage.setItem('userPhone', phoneNumber);
                
                // Redirect to profile page after successful OTP verification
                setTimeout(() => {
                    showPage('profile');
                }, 1000);
            } else {
                showMessage('otp-message', 'Invalid OTP. Please use: 123456', 'error');
            }
        }

        // Registration
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            try {
                const result = await auth.createUserWithEmailAndPassword(email, password);
                showMessage('register-message', `Welcome ${email}! Registration successful.`, 'success');
                setTimeout(() => showPage('login'), 2000);
            } catch (error) {
                console.error('Registration error:', error);
                showMessage('register-message', error.message, 'error');
            }
        });

        // Login
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const result = await auth.signInWithEmailAndPassword(email, password);
                showMessage('login-message', `Welcome back ${email}!`, 'success');
                setTimeout(() => showPage('documents'), 2000);
            } catch (error) {
                console.error('Login error:', error);
                showMessage('login-message', error.message, 'error');
            }
        });

        // Profile submission
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const profileData = {
                firstname: document.getElementById('firstname').value,
                lastname: document.getElementById('lastname').value,
                aadharNumber: document.getElementById('aadharNumber').value,
                email: document.getElementById('email').value,
                gender: document.getElementById('gender').value,
                date: document.getElementById('date').value,
                age: document.getElementById('age').value,
                country: document.getElementById('country').value,
                state: document.getElementById('state').value,
                city: document.getElementById('city').value,
                phone: localStorage.getItem('userPhone') || 'Not provided'
            };

            // Save to Firebase
            db.collection('users').doc(profileData.aadharNumber).set(profileData)
                .then(() => {
                    showMessage('profile-message', 'Profile saved successfully to Firebase!', 'success');
                    displayProfile(profileData.aadharNumber);
                })
                .catch((error) => {
                    console.error('Error saving profile:', error);
                    showMessage('profile-message', 'Error saving profile: ' + error.message, 'error');
                });
        });

        // Display profile
        function displayProfile(aadharNumber) {
            db.collection('users').doc(aadharNumber).get()
                .then((doc) => {
                    if (doc.exists) {
                        const profile = doc.data();
                        document.getElementById('profile-details').innerHTML = `
                            <div class="profile-display">
                                <h3>Profile Details (Stored in Firebase)</h3>
                                <div class="profile-item"><strong>First Name:</strong> <span>${profile.firstname}</span></div>
                                <div class="profile-item"><strong>Last Name:</strong> <span>${profile.lastname}</span></div>
                                <div class="profile-item"><strong>Aadhaar:</strong> <span>${aadharNumber}</span></div>
                                <div class="profile-item"><strong>Email:</strong> <span>${profile.email}</span></div>
                                <div class="profile-item"><strong>Phone:</strong> <span>${profile.phone}</span></div>
                                <div class="profile-item"><strong>Gender:</strong> <span>${profile.gender}</span></div>
                                <div class="profile-item"><strong>Date of Birth:</strong> <span>${profile.date}</span></div>
                                <div class="profile-item"><strong>Age:</strong> <span>${profile.age}</span></div>
                                <div class="profile-item"><strong>Country:</strong> <span>${profile.country}</span></div>
                                <div class="profile-item"><strong>State:</strong> <span>${profile.state}</span></div>
                                <div class="profile-item"><strong>City:</strong> <span>${profile.city}</span></div>
                            </div>
                        `;
                    } else {
                        document.getElementById('profile-details').innerHTML = '<p>No profile found</p>';
                    }
                })
                .catch((error) => {
                    console.error('Error getting profile:', error);
                    showMessage('profile-message', 'Error loading profile: ' + error.message, 'error');
                });
        }

        // Upload files
        function uploadFiles() {
            const fileInput = document.getElementById('file-input');
            const files = fileInput.files;

            if (files.length === 0) {
                showMessage('upload-message', 'Please select files to upload', 'error');
                return;
            }

            Array.from(files).forEach((file, index) => {
                const storageRef = storage.ref('files/' + file.name);
                const uploadTask = storageRef.put(file);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        showMessage('upload-message', `Uploading ${file.name}: ${Math.round(progress)}%`, 'success');
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        showMessage('upload-message', `Error uploading ${file.name}: ${error.message}`, 'error');
                    },
                    () => {
                        showMessage('upload-message', `${file.name} uploaded successfully!`, 'success');
                    }
                );
            });
        }

        // Delete file
        function deleteFile() {
            const fileName = document.getElementById('fileName').value;
            
            if (!fileName) {
                showMessage('delete-message', 'Please enter a file name to delete', 'error');
                return;
            }

            const fileRef = storage.ref('files/' + fileName);
            
            fileRef.delete()
                .then(() => {
                    showMessage('delete-message', 'File deleted successfully!', 'success');
                    document.getElementById('fileName').value = '';
                })
                .catch((error) => {
                    console.error('Delete error:', error);
                    showMessage('delete-message', 'Error deleting file: ' + error.message, 'error');
                });
        }

        // Logout
        function logout() {
            auth.signOut()
                .then(() => {
                    localStorage.removeItem('userPhone');
                    document.getElementById('signoutsuccess').textContent = 'Logged out successfully';
                    showPage('home');
                })
                .catch((error) => {
                    console.error('Logout error:', error);
                });
        }

        // Show message helper
        function showMessage(elementId, message, type) {
            const messageDiv = document.getElementById(elementId);
            messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 5000);
        }

        // Monitor auth state
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User is signed in:', user.email);
            } else {
                console.log('User is signed out');
            }
        });
