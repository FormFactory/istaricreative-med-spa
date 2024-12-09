const params = {
    "month": "December 2024",
    "url": "https://example.com/content-calendar",
    "posts": [
        { "date": "2024-12-05", "pillar": "Awareness", "title": "Post 1", "description": "Description 1", "hashtags": "#tag1" },
        { "date": null, "pillar": "Engagement", "title": "Post 2", "description": "Description 2", "hashtags": "#tag2" },
        { "date": "2024-12-03", "pillar": "Conversion", "title": "Post 3", "description": "Description 3", "hashtags": "#tag3" }
    ]
};

function doPost(e) {
    try {
        // Parse and validate input
        const params = JSON.parse(e.postData.contents);
        validateInput(params);

        const { month, url, posts } = params;

        // Process and sort posts
        const sortedPosts = sortPosts(posts);

        // Create and format the Google Doc
        const docUrl = createContentCalendarDoc(month, url, sortedPosts);

        Logger.log(docUrl)

        // Return success response
        return successResponse(docUrl);

    } catch (error) {
        return errorResponse(error.message);
    }
}

// Validate input parameters
function validateInput(params) {
    if (!params.month || !params.url) {
        throw new Error("Missing required parameters: 'month' and 'url'");
    }
    if (!Array.isArray(params.posts)) {
        throw new Error("'posts' must be an array");
    }
}

// Sort posts by date (dated first, undated last)
function sortPosts(posts) {
    const datedPosts = [];
    const undatedPosts = [];

    posts.forEach(post => {
        const parsedDate = post.date ? new Date(post.date) : null;
        if (parsedDate && !isNaN(parsedDate)) {
            datedPosts.push({ ...post, parsedDate });
        } else {
            undatedPosts.push({ ...post, parsedDate: null });
        }
    });

    // Sort dated posts by date
    datedPosts.sort((a, b) => a.parsedDate - b.parsedDate);

    return [...datedPosts, ...undatedPosts];
}

// Create the Google Doc
function createContentCalendarDoc(month, url, posts) {
    const fileName = `${month} Content Calendar`;
    const doc = DocumentApp.create(fileName);
    const body = doc.getBody();

    // Add header
    body.appendParagraph(`Easy! ${month} Content Calendar`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);

    const generatedDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy");

    // body.appendParagraph(`Generated on: ${new Date().toLocaleDateString()}`)
    //     .setHeading(DocumentApp.ParagraphHeading.NORMAL);

    body.appendParagraph(`Generated on: ${generatedDate}`)
        .setHeading(DocumentApp.ParagraphHeading.NORMAL);

    // Add spacing
    body.appendParagraph('');

    // Add posts
    posts.forEach(post => appendPostToDoc(body, post));

    // Add footer
    addFooter(doc, url);

    // Share the document and return the URL
    const file = DriveApp.getFileById(doc.getId());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    doc.saveAndClose();

    return doc.getUrl();
}

// Append a single post to the document
function appendPostToDoc(body, post) {
    const dateLabel = post.parsedDate
        ? post.parsedDate.toLocaleDateString()
        : "No Date Assigned Yet";

    // Append Date without a bullet
    body.appendParagraph(`Date: ${dateLabel}`);

    // Define the labels and their corresponding content
    const fields = [
        { label: "Pillar", content: post.pillar },
        { label: "Title", content: post.title },
        { label: "Description", content: post.description },
        { label: "Hashtags", content: post.hashtags || "N/A" },
        { label: "Canva Link", content: "" }
    ];

    // Append each field as a bullet with bold label
    fields.forEach(({ label, content }) => {
        const listItem = body.appendListItem(`${label}: ${content}`)
            .setGlyphType(DocumentApp.GlyphType.BULLET);
        listItem.editAsText().setBold(0, label.length + 1, true); // Bold the label
    });

    // Add spacing between posts
    body.appendParagraph('');
}

function addFooter(doc, url) {
    const footer = doc.addFooter();
    const footerText = footer.appendParagraph(url); // Only append the URL

    // Set the alignment of the URL to be at the bottom right
    footerText.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

    // Set the font size to be smaller (e.g., 10pt)
    footerText.setFontSize(10);

    // Optional: If you want the link to be clickable
    footerText.editAsText().setLinkUrl(url);
}



// Generate a success response
function successResponse(docUrl) {
    Logger.log("success")
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        documentUrl: docUrl,
        timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
}

// Generate an error response
function errorResponse(message) {
    Logger.log("error")
    return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: message
    })).setMimeType(ContentService.MimeType.JSON);
}
