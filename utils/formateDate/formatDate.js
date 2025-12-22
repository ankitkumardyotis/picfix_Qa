

const formattedDate = (date) => {
    const originalDatetimeString = date;
    // Convert to JavaScript Date object
    const originalDate = new Date(originalDatetimeString);
    // Format the date
    const formattedDatetimeString = originalDate.toLocaleString(); // Use appropriate formatting options as per your requirement\
    return formattedDatetimeString
}



export default formattedDate