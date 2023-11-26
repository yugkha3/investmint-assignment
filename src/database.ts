import mongoose, { ConnectOptions, Document, Schema } from 'mongoose';
require('dotenv').config();

const uri = process.env.MONGODB_URI as string;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions);
const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error: ', err);
    process.exit(1);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

const userSchema = new Schema({
    user_id: Number,
});

interface User extends Document {
    user_id: number;
}

const UserModel = mongoose.model<User>('User', userSchema);

async function addUserToDB(user_id: number): Promise<void> {
    const user = new UserModel({ user_id });
    try {
        await user.save();
        console.log(`User added to the database: ${user_id}`);
    } catch (err) {
        console.error('Error adding user to the database: ', err);
    }
}

async function removeUserFromDB(user_id: number): Promise<void> {
    try {
        await UserModel.deleteOne({ user_id });
        console.log(`User removed from the database: ${user_id}`);
    } catch (err) {
        console.error('Error removing user from the database:', err);
    }
}

export { UserModel, addUserToDB, removeUserFromDB };