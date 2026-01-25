const Address = require('./backend/src/models/Address');

async function test() {
    console.log('Testing Address Model...');
    try {
        const data = {
            userId: 'test-user-123',
            label: 'Test Home',
            recipientName: 'Budi Test',
            phoneNumber: '08123456789',
            fullAddress: 'Jl. Testing No. 1',
            city: 'Jakarta',
            isDefault: true
        };

        console.log('Creating address...');
        const result = await Address.create(data);
        console.log('Address Created:', result);
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
