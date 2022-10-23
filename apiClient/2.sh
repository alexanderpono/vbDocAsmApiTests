#!/bin/bash

# npm run wordStart
# npm run docOpen "d:/www/doc1.doc"
# npm run wordClose

./asm.sh wordStart
./asm.sh docOpen "d:/www/docs/doc-act.doc"
./asm.sh replaceFirstWithText "@num;" "000018"
./asm.sh replaceFirstWithText "@date;" "26 Апреля 2012 г."
# ./asm.sh docClose
# ./asm.sh wordClose
 
