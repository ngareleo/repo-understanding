import { createServer } from "node:http";

const server = createServer((req, res) => {
    console.log(`Request received for ${req.headers.location}`);
    res.write("Hello traveler!");
    res.end();
});

server.listen(3000);
