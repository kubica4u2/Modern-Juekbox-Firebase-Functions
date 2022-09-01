const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.UserSignUp = functions.auth.user().onCreate((user) => {

    const uid = user.uid;
    const email = user.email; // The email of the user.
    const nEmail = email.substring(0, email.indexOf('@'));
    let photoURL = user.photoURL;

    if(photoURL === null) {
        photoURL = 'https://firebasestorage.googleapis.com/v0/b/modern-jukebox-cd98e.appspot.com/o/avatar.png?alt=media&token=f4f2f773-e39f-4e45-9107-22145f267fcf';
    }

    return admin.firestore().collection('users').doc(uid).set({
        uid: uid,
        email: email,
        displayName: nEmail,
        photoURL: photoURL
    });

});

exports.DeleteUser = functions.auth.user().onDelete((user) => {
    const uid = user.uid;
    return admin.firestore().collection('users').doc(uid).delete();
});

exports.UpdateUserDisplayName = functions.firestore.document('users/{id}')
    .onWrite((event) => {
        let dn = event.after.data().displayName;
        let uid = event.after.data().uid;
        let photo = event.after.data().photoURL;

        return admin.auth().updateUser(uid, {
            displayName: dn,
            photoURL: photo
        }).then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully updated user", userRecord.toJSON());
        })
        .catch((error) => {
            console.log("Error updating user:", error);
        });

    });

exports.sendNotification = functions.firestore.document('users/{uid}/videos/{videoId}')
    .onCreate((snap, context) => {

        const { token, thumbnail, title } = snap.data();

        let message = {
            data: {
                title,
                thumbnail
            },
            token: token
        }

        admin.messaging().send( message ).then(( res ) => {
            console.log('Successfully sent message:', res);
        }).catch(( err ) => {
            console.log('Error sending message:', err);
        });

    });
