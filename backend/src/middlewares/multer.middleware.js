import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

const storageFile = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/files")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
  
export const upload = multer({ 
    storage,
})

export const uploadFile = multer({
  storage: storageFile,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error("Only .txt files allowed"));
    }
  }
});

 