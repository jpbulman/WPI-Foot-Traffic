# Many of the buildings in Open Street Map have different names
# than the names we had in the survey responses, so this script
# cleans the names so that they match. The original responses are in
# 'responses.csv' and the cleaned ones are in 'output.csv'
text = open("responses.csv", "r")
text = ''.join([i for i in text]).replace("Rubin Campus Center", "Campus Center").replace("Higgins Labs", "Higgins Laboratories").replace("Fuller Labs", "Fuller Laboratories")
text = ''.join([i for i in text]).replace("Atwater Kent", "Atwater Kent Laboratories").replace("Gordon Library", "George C. Gordon Library")
text = ''.join([i for i in text]).replace("Salisbury Hall", "Salisbury Laboratories").replace("Salisbury Labs", "Salisbury Laboratories")
text = ''.join([i for i in text]).replace("Alden  Hall", "Alden Memorial").replace("East", "East Hall")
text = ''.join([i for i in text]).replace("Washburn", "Washburn Shops and Stoddard Laboratories").replace("WPI Sports and Rec Center", "WPI Sports and Recreation Center")
text = ''.join([i for i in text]).replace("Founder's Hall", "Founders Hall").replace("Faraday", "Farady")
x = open("output.csv","w")
x.writelines(text)
x.close()