const logOut = (req, res) => {
    req.logout( (err) => {
        if (err) {
          console.error('Error occurred while logging out:', err);
          // Handle error if logout fails
          return res.status(500).send('Internal Server Error');
        }
    
        // Clear session and redirect after successful logout
        req.session.destroy(function (err) {
          if (err) {
            console.error('Error occurred while destroying session:', err);
            // Handle error if session destroy fails
            return res.status(500).send('Internal Server Error');
          }
    
          // Redirect or perform any other actions after successful logout
        });
      });
      res.redirect('/');
  }

  module.exports = logOut