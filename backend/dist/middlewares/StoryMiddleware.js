const storyMiddleware = (req, res, next) => {
    try {
        // Example: Check if the story data exists in the request body
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required for the story.' });
        }
        // Perform additional validation or processing if needed
        // Example: Limit the title length
        if (title.length > 100) {
            return res.status(400).json({ message: 'Title cannot exceed 100 characters.' });
        }
        // If everything is valid, proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred in the story middleware.', error });
    }
};
export default storyMiddleware;
