# (WIP) Python DApp for Judging Artwork

This is backend for a Cartesi DApp that judges user drawn artwork. It uses python3 to execute the backend application. The application entrypoint is the `dapp.py` file.

### Inputs

The DApp currently accepts below JSON input:

```json
{"compressed_doodle": "...", "type": "circle"}
```

The `compressed_doodle` is a base64 encoded string of the user's drawing. The `type` is a string that is `circle` shape(more shapes will be added in the future).

### Outputs

The DApp will output a JSON object with the following signature:

```json
{"score": 0.585625472333774, "message": "Your circle scored 58% accuracy."}
```

## Running the backend

**NOTE:** Before you build the backend inside the Cartesi Machine, make sure you're using the RISC-V wheels for OpenCV and NumPy in the `requirements.txt` file.

Inside the `cartesi-backend` directory, run the following command to build the backend:

```bash
cartesi build
```

Spin up the devnet environment:

```bash
cartesi run
```

Now, use `cartesi send` command to send the JSON input to the DApp:





