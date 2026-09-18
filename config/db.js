import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from server/.env');
    }

    const uri = process.env.MONGODB_URI;
    const userMatch = uri.match(/^mongodb\+srv:\/\/([^:]+):/);
    const hostMatch = uri.match(/@([^/]+)\//);
    console.log(`Connecting to MongoDB as user: ${userMatch ? decodeURIComponent(userMatch[1]) : 'unknown'}`);
    console.log(`Cluster host: ${hostMatch ? hostMatch[1] : 'unknown'}`);
    console.log('If Atlas Database Access is in a different project, this host will not match that user.');

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    if (String(error.message).includes('bad auth') || String(error.message).includes('Authentication failed')) {
      console.error('Atlas rejected the database username/password.');
      console.error('Use Database Access (not your Atlas website login).');
      console.error('Give the user "Read and write to any database" and access to this cluster.');
      console.error('Wait 1–2 minutes after creating/resetting the user, then restart the server.');
    }
    process.exit(1);
  }
};

export default connectDB;
