import pandas as pd

# Load the XLSM file
xlsm_file = 'docs/Ice Cream Master Document.xlsm'
df = pd.read_excel(xlsm_file, sheet_name='Sheet1', engine='openpyxl')

# Convert the DataFrame to a JSON array
json_array = df.to_json(orient='records')

# Save the JSON array to a file
with open('Ice-Cream-Master-Document.json', 'w') as json_file:
    json_file.write(json_array)

print("Conversion complete! JSON array saved to Ice-Cream-Master-Document.json")
