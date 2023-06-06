const home = (req, res) => {
    res.redirect('/home/index');
}

const homePage = (req, res) => {
    res.render('index', {title: 'Home'});
}

module.exports = {
    home, 
    homePage
}