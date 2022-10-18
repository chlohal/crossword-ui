# crossword-ui
A rough crossword puzzle UI in Snap.

This is a class project for my Ethical Computing class.
The assignment was to make a crossword-solving app for a class-provided puzzle. I wanted to improve it, so I made mine work for *any* puzzle-- with some preprocessing.

Snap is... limited, so parsing and *using* JSON directly was infeasible. I coded a quick-and-dirty Node.JS wrapper to convert crossword JSON into the ad-hoc format that my crossword app uses.

An explanation of the JSON format used can be found [here](https://www.xwordinfo.com/JSON/). 
NYT crosswords were taken from [doshea/nyt_crosswords](https://github.com/doshea/nyt_crosswords).

The project itself can be found [here](https://snap.berkeley.edu/snap/snap.html#present:Username=chlohal&ProjectName=U2L3-WordPuzzleSolver).
