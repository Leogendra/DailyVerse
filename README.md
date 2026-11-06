# Daily Verse

One random daily game per day, picked from a list of 700+ daily web games.  
Everyone gets the same game on the same calendar day. The pick changes at midnight, local time.


## Dailyrush

Dailyrush is a list of games you play every day, defined in `dailyrush.json`:

```json
[
    {
        "name": "Krillion",
        "url": "https://krillion.io/",
        "score": { 
            "pattern": "^(\\d+)$",
            "typical": 297,
            "max": 595,
            "weight": 1
        }
    }
]
```

Play every game and paste all the results to get your daily score out of 100 (`DailyRush Score : 63/100 (15-17-16-15)`), each number in parentheses being one game's contribution to the total.  
The list is fully customizable: add, remove or reorder the games in `dailyrush.json`.


## Thanks

The daily game list comes from [dles.aukspot.com](https://dles.aukspot.com/).
