#!/usr/bin/env bash
echo configs/*.json | python3 ../mozbutton_sdk/build.py -p toolbar_button.json local.json single.json
