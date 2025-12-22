const diffrenceTime = (date) => {
    const createdAtDate = new Date(date);
    const now = new Date();

    const diffInMs = now - createdAtDate;

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let formattedDate;
    if (diffInMinutes < 1) {
        formattedDate = 'Just now';
    } else if (diffInMinutes < 60) {
        formattedDate = `${diffInMinutes} Minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        formattedDate = `${diffInHours} Hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
        formattedDate = `${diffInDays} Day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    return formattedDate
}


export default diffrenceTime


