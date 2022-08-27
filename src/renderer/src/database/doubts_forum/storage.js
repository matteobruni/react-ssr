import { storage } from "../../firebase_config";

// -----------------------------
//          FIREBASE STORAGE

const deleteImageByUrl = (url) => {
  // Create a reference to the file to delete
  var desertRef = storage.refFromURL(url);

  // Delete the file
  desertRef
    .delete()
    .then(function () {
      // File deleted successfully
    })
    .catch(function (error) {
      console.error(`Error ${error} while deleteImageByUrl for url: ${url}`);
      // Uh-oh, an error occurred!
    });
};

export { deleteImageByUrl };
