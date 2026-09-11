with open("src/pages/Category.jsx", "r") as f:
    content = f.read()

content = content.replace("{!loading && (\\n          <div", "{!loading && (\\n          <>\\n          <div")
content = content.replace("</div>\\n          )}\\n\\n      </div>\\n\\n      {/* ZONE 4: Related Categories (Full Width Below) */}", "</div>\\n          </>\\n          )}\\n\\n      </div>\\n\\n      {/* ZONE 4: Related Categories (Full Width Below) */}")

with open("src/pages/Category.jsx", "w") as f:
    f.write(content)

