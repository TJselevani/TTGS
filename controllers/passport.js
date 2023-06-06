const {getAdmin, getLecturer, getAdminById, getLecturerById } = require('./service')

const authenticateAdmin = async (username, password, done) => {
    console.log("Login Credentials for Admin: ", username, password)
    const user = await getAdmin(username, password)
    if (!user) {
        console.log('The Admin does not Exist || null')
        return done(null, false, console.log({ message: 'The Admin does not Exist' }))
    }
    try {
        if (password === user.password) {
        return done(null, user, console.log({ message: 'Admin Logged in Successfully' }))
        } else {
            console.log('Password incorrect')
        return done(null, false, console.log({ message: 'Password is not correct' }))
        }
    } catch (err) {
        console.log('Error While Comparing passwords')
        return done(err)
    }
}

const authenticateLecturer = async (req, done) => {
    const username = req.body.lecturerId
    console.log("Login Credentials for Lecturer: ", username)
    const user = await getLecturer(username)
    if (!user) {
    return done(null, false, console.log({ message: 'No Lecturer with that Id' }))
    }
    return done(null, user, console.log({ message: 'Lecturer Logged in Successfully' }))
}

const getUserById = async(_id) => {
    console.log("ID that wa serialized ",_id)
    try {
        const user = await getLecturerById(_id)
        if(user){  return user}
        if(!user){
            const user = await getAdminById(_id) 
            if(user){   return user}
        }
    }catch(err){console.log(err)}  
}

module.exports = { authenticateAdmin, authenticateLecturer, getUserById }