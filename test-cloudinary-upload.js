// Test Cloudinary upload with URLSearchParams
async function testCloudinaryUpload() {
  const testImageUrl = 'https://scontent.cdninstagram.com/v/t51.71878-15/518835822_1790035214934423_2702500845379191147_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&ccb=1-7&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=UoT292xY5PUQ7kNvwEVQtqa&_nc_oc=Adm-YJRRbhCO7gFpjlUPrg7sYSJIgWM0inuJo8CAp1816gX4WTv88QFFpO0K2n1UT3g&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=wkYiT5cLnnuHeRNkY-qyfg&oh=00_Afh1_AVJo3NORHQc92YEoRQUR7vQSYQFfe8yOcnsiitk6Q&oe=691D82C3';
  
  console.log('Testing Cloudinary upload...');
  console.log('Image URL:', testImageUrl.substring(0, 80) + '...');
  
  try {
    const formBody = new URLSearchParams({
      file: testImageUrl,
      upload_preset: 'innov8_portfolio',
      folder: 'innov8_portfolio/instagram',
    });

    console.log('\nForm body:', formBody.toString().substring(0, 150) + '...');

    const uploadResponse = await fetch(
      'https://api.cloudinary.com/v1_1/dm22wlmpx/image/upload',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      }
    );

    console.log('\nResponse status:', uploadResponse.status);
    const data = await uploadResponse.json();
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!');
      console.log('Secure URL:', data.secure_url);
    } else {
      console.log('❌ Upload failed!');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCloudinaryUpload();

