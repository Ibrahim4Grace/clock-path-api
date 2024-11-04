
import axios from 'axios';

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json`,
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return {
        coordinates: [location.lng, location.lat], // [longitude, latitude] for MongoDB
        formattedAddress: response.data.results[0].formatted_address
      };
    } else {
      throw new Error('Unable to geocode address');
    }
  } catch (error) {
    throw new Error('Geocoding service error: ' + error.message);
  }
};