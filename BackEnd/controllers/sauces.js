const fs = require('fs');
const Sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //convertisement en un objet JavaScript
  delete sauceObject._id; //définie automatiquement par MongoDB 
  delete sauceObject._userId; //définie automatiquement par MongoDB 
  const sauce = new Sauce({
    ...sauceObject, //nouvelle instance
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Objet enregistré !'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error
      });
    }
  );
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  //delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (req.body.like === 1) {
        let newUsersLiked = sauce.usersLiked;
        newUsersLiked.push(req.body.userId);
        let newSauce = {
          //...sauce,
          likes: sauce.likes + 1, usersLiked: newUsersLiked
        }
        Sauce.updateOne({ _id: req.params.id }, newSauce)
          .then(() => res.status(200).json({ message: 'Sauce liké' }))
          .catch(error => res.status(401).json({ error }));
      }
      if (req.body.like === -1) {
        let newUsersDisliked = sauce.usersDisliked;
        newUsersDisliked.push(req.body.userId);
        let newSauce = {
          //...sauce,
          dislikes: sauce.dislikes + 1, usersDisliked: newUsersDisliked
        }
        Sauce.updateOne({ _id: req.params.id }, newSauce)
          .then(() => res.status(200).json({ message: 'Sauce disliké' }))
          .catch(error => res.status(401).json({ error }));
      }
      if (req.body.like === 0) {
        if(sauce.usersLiked.includes(req.body.userId)) {
          let newSauce = {
            likes: sauce.likes - 1, $pull: {usersLiked: req.body.userId}
          }
          Sauce.updateOne({ _id: req.params.id }, newSauce)
            .then(() => res.status(200).json({ message: 'like annulé' }))
            .catch(error => res.status(401).json({ error }));
          }
          if(sauce.usersDisliked.includes(req.body.userId)) {
            let newSauce = {
              dislikes: sauce.dislikes - 1, $pull: {usersDisliked: req.body.userId}
            }
            Sauce.updateOne({ _id: req.params.id }, newSauce)
              .then(() => res.status(200).json({ message: 'disliké annulé' }))
              .catch(error => res.status(401).json({ error }));
          }
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};