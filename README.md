# fb_comment_tree
Export Facebook comment tree as text

### Download the FB thread
* Open Chrome
* Open Dev Tools
* Navigate to the FB thread you want to analyze
* Clear the Network tab
* Reload the page
* Expand all the sub-threads you want included
* In the network tab right click on the first url and 'Save all as HAR with content'

### Convert HAR into fb comment thread 
```
har2tree.sh www.facebook.com.har
```

### What does it do?
#### Prepare HAR
HAR is very large and cannot be parsed as a single unit. First we need to break it down into manageable pieces.
```
splitHAR.sh www.facebook.com.har
```

This will take a while, so go have a coffee or do laundry. I am doing both as I am writing this.

#### Extract responses
```
entryToRes.sh hars/www.facebook.com.har/*.entry
```

#### Produce comment thread
```
fbCommentTree.js hars/www.facebook.com.har/*.res
```
