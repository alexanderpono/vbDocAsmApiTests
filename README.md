# server API for generation of a document

## wordStart
request:
```
wordStart
```

answer:
```
{
    "status": "OK"
}
```


## error cases
### 1. unknown command

request:
```
Health
```

answer:
```
{
    "status": "USER_ERROR",
    "body": "UNKNOWN_COMMAND"
}
```