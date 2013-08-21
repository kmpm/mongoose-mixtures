# mixtures
A shot at creating some sort of fixture loading framework for mongoose with
mongoexport format JSON as input data.

For the moment the JSON file requires the default mongoexport format which 
is one record per line. This in combination with ReaderStream makes it
possible to load HUGE fixtures since not all of it needs to be in RAM
at the same time.


## Usage
To be done!

...for the moment look at test/test.loader.js



## Installation
```
  npm install mixtures
```

