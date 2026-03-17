require('dotenv').config()
const { generateSummary } = require('../lib/summarise')

async function test() {
  const mockTranscript = "Hello everyone, my name is John. We decided today to launch the new website on Friday. Let's make sure the DNS settings are updated by Alice."
  await generateSummary(mockTranscript, "dummy-test-id")
}
test()
