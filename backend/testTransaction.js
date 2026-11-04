import "dotenv/config";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

async function testTransaction() {
    let session;

    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully.");

        const collection = mongoose.connection.db.collection(
            "farm2home_transaction_test"
        );

        // Ensure the test collection exists before starting the transaction.
        try {
            await collection.insertOne({
                setup: true,
                createdAt: new Date(),
            });
            await collection.deleteOne({ setup: true });
        } catch (error) {
            throw error;
        }

        session = await mongoose.startSession();
        session.startTransaction();

        await collection.insertOne(
            {
                testId: randomUUID(),
                createdAt: new Date(),
            },
            { session }
        );

        console.log("Transaction write executed successfully.");

        // Roll back the test write so no test document remains.
        await session.abortTransaction();

        console.log("SUCCESS: MongoDB transactions are supported.");
    } catch (error) {
        console.error("TRANSACTION TEST FAILED:");
        console.error(error.message);

        if (session?.inTransaction()) {
            await session.abortTransaction();
        }
    } finally {
        if (session) {
            await session.endSession();
        }

        await mongoose.disconnect();
    }
}

testTransaction();