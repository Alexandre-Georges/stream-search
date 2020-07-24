# Random stream search

## Requirements

This project requires to have NodeJS installed, version >= 14.6.0. It relies on Streams and Worker Threads which are quite recent.

## Execution

To get help regarding how to run the program:

```bash
sh run.sh --help
```

To specify the timeout (in milliseconds):

```bash
sh run.sh --timeout=12345
```

To specify the number of workers:

```bash
sh run.sh --workers=12
```

## Edge cases

To generate an error, you can change `worker/reader.js` and uncomment the code line that calls a function that does not exist.
