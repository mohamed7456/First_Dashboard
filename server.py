from sqlite3 import Error
from flask import Flask, jsonify, render_template
import sqlite3
import pandas as pd
from sqlalchemy import create_engine, text


def create_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)
    return conn

df = pd.read_csv("MultinationalCompanyData.csv")
connection = create_connection("demo.db")
df.to_sql("company_data", connection, if_exists='replace')
connection.close()

db_url = 'sqlite:///demo.db'
engine = create_engine(db_url, echo = True)


app = Flask(__name__)

@app.route('/favicon.ico')
def favicon():
    return''

@app.route('/')
def index():
    return render_template('index.html')


#Chart 1
@app.route('/get-employee-count-by-country')
def get_employee_count_by_country():
    print(f"Accessing /get-employee-count-by-country endpoint...")

    with engine.connect() as conn:
        # Modify the query to get the average employee count based on the selected year
        query = text("""
                SELECT Country, AVG(EmployeeCount) as AverageEmployeeCount
                FROM company_data
                GROUP BY Country
            """)
        
        result = list(conn.execute(query))
        data = [{'Country': row[0], 'AverageEmployeeCount': row[1]} for row in result]

    return jsonify(data)



# Chart 2
@app.route('/get-country-sales-count')
def get_country_sales_count():
    print("Accessing /get-country-sales-count endpoint...")
    with engine.connect() as conn:
        query = text("""
            SELECT Country, Branch, SUM(SalesQuantity) as BranchSalesCount
            FROM company_data
            GROUP BY Country, Branch
        """)
        result = list(conn.execute(query))

        # Organize data in the desired format
        data = []
        for row in result:
            country_entry = next((entry for entry in data if entry['category'] == row[0]), None)

            if country_entry is None:
                # If the country doesn't exist in data, add a new entry
                country_entry = {'category': row[0], 'value': 0, 'subData': []}
                data.append(country_entry)

            # Update the total sales count for the country
            country_entry['value'] += row[2]

            # Add branch entry to subData
            country_entry['subData'].append({'category': row[1], 'value': row[2]})

    return jsonify(data)




#Chart 3
# Route to fetch sales count by product
@app.route('/get-sales-count-by-product')
def get_sales_count_by_product():
    print("Accessing /get-sales-count-by-product endpoint...")
    with engine.connect() as conn:
        query = text("""
            SELECT Product, SUM(SalesQuantity) as SalesCount
            FROM company_data
            GROUP BY Product
        """)
        result = list(conn.execute(query))
        data = [{'product': row[0], 'salesCount': row[1]} for row in result]
    return jsonify(data)



#Chart 4
@app.route('/get-product-revenue')
def get_product_revenue():
    print("Accessing /get-product-revenue endpoint...")
    with engine.connect() as conn:
        query = text("""
            SELECT Product, Year, Month, SUM(Revenue) as ProductRevenue
            FROM company_data
            GROUP BY Product, Year, Month
        """)
        result = list(conn.execute(query))
        data = [{'Product': row[0], 'Year': row[1], 'Month': row[2], 'ProductRevenue': row[3]} for row in result]
    return jsonify(data)


# Chart 5
# Route to fetch revenue composition by product within each year
@app.route('/get-revenue-composition-by-product')
def get_revenue_composition_by_product():
    print("Accessing /get-revenue-composition-by-product endpoint...")
    with engine.connect() as conn:
        query = text("""
            SELECT Year, Product, SUM(Revenue) as TotalRevenue
            FROM company_data
            GROUP BY Year, Product
        """)
        result = list(conn.execute(query))
        
        # Organize data in the desired format
        data = []
        for year in set(row[0] for row in result):
            year_data = {"year": str(year)}
            for row in result:
                if row[0] == year:
                    year_data[row[1].lower()] = float(row[2])
            data.append(year_data)
            
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
    
    