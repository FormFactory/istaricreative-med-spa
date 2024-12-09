// code goes to script.gs Google cloud web app backend
function doPost(e) {
    // Parse the received data
    const params = JSON.parse(e.postData.contents);

    // Group posts by week
    const postsByWeek = params.reduce((acc, post) => {
        if (!acc[post.week]) {
            acc[post.week] = [];
        }
        acc[post.week].push(post);
        return acc;
    }, {});

    // Get the current date and time for the filename
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure 2 digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so +1
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    // Construct the filename as 'Export-DD-MM-YYYY-HH:MM'
    const fileName = `Export-${day}-${month}-${year}-${hour}:${minute}`;
    const doc = DocumentApp.create(fileName);
    const body = doc.getBody();

    // Add a title to the document
    body.appendParagraph('Exported Posts')
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);

    // Iterate over the weeks and add grouped posts to the document
    Object.keys(postsByWeek).sort().forEach(week => {
        body.appendParagraph(`Week: ${week}`) // Add week header
            .setHeading(DocumentApp.ParagraphHeading.HEADING2);

        postsByWeek[week].forEach(post => {
            body.appendParagraph(`Pillar: ${post.pillar}`)
                .setHeading(DocumentApp.ParagraphHeading.HEADING3);
            body.appendParagraph(`Title: ${post.title}`)
                .setHeading(DocumentApp.ParagraphHeading.HEADING3);
            body.appendParagraph(`Description: ${post.description}`)
                .setHeading(DocumentApp.ParagraphHeading.NORMAL);
            body.appendParagraph(''); // Add a blank line for spacing
        });
    });

    // Make the document publicly accessible
    const file = DriveApp.getFileById(doc.getId());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Save and close the document
    doc.saveAndClose();

    // Get the URL of the created document
    const docUrl = doc.getUrl();

    // Return a success message with the document URL
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        documentUrl: docUrl
    })).setMimeType(ContentService.MimeType.JSON);
}
