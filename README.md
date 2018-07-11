# HL7-834EZ
An easy to use script for reading HL7 834 files into a CSV format.

I learned a few things while working on this. I came at it with little to no knowledge of HL7 other than it's a text file format used for transmitting objects for health care. I had an assumption that 834 files followed a specific format, and they do not. We (my employer) defined the format, so while this project suits our needs, it will most likely need tweaking to suit yours. 

Why did I start a new project when there are plenty of other HL7 projects on GitHub? For one, I wanted to expand my understanding of HL7, but also it seems like most of the other projects would still have neded almost as much work for us to use since ultimately my stakeholders need a CSV file.

You'll notice that I'm not using a loop and instead calling a function recursively with setTimeout. This is to give the thread a moment to update the UI. If pure speed is your game and you don't care about showign progress, rip out anything that's not throwing error information to the DOM, and switch it to a loop.
