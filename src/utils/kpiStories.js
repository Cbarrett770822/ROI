/**
 * KPI Story Data
 * 
 * This file contains detailed context and stories for each KPI in the dashboard.
 * Each KPI has a title, story (detailed explanation), impact (business impact),
 * and recommendations based on the metric.
 */

const kpiStories = {
  // Executive Dashboard KPIs
  "Supplier OTIF": {
    title: "Supplier On-Time In-Full",
    story: "Supplier OTIF (On-Time In-Full) measures the percentage of orders delivered by suppliers that are both on time and contain all the requested items. This metric is critical for maintaining smooth operations and avoiding production delays. Our historical data shows that every 1% improvement in OTIF correlates with a 0.5% reduction in production downtime.",
    impact: "Low OTIF rates directly impact production schedules, inventory levels, and ultimately customer satisfaction. When suppliers consistently miss delivery targets or send incomplete shipments, it creates a ripple effect throughout the supply chain.",
    recommendations: [
      "Below 85%: Implement supplier improvement programs and consider diversifying your supplier base",
      "85-95%: Work with key suppliers on continuous improvement initiatives",
      "Above 95%: Maintain current supplier relationships and consider incentive programs for consistent performance"
    ],
    benchmarks: "Industry average: 88% | Best-in-class: 97%"
  },
  "Production Throughput": {
    title: "Production Throughput",
    story: "Production Throughput measures the total volume of units processed through our manufacturing facilities each month. This KPI reflects our operational efficiency and capacity utilization. The metric is calculated by aggregating daily production rates across all production lines and normalizing to monthly figures.",
    impact: "Production throughput directly affects our ability to meet customer demand, optimize resource utilization, and maintain competitive pricing. Higher throughput generally indicates better fixed cost absorption and improved profitability.",
    recommendations: [
      "Below target: Review bottlenecks in the production process and implement targeted improvements",
      "At target: Focus on stability and quality while maintaining current throughput",
      "Above target: Ensure quality is not compromised and consider if capacity can be redirected to higher-margin products"
    ],
    benchmarks: "Previous year average: 2.2M units | Current target: 2.5M units"
  },
  "Inventory Age": {
    title: "Inventory Age",
    story: "Inventory Age tracks the average number of days that inventory items remain in our warehouses before being used in production or shipped to customers. This metric helps identify slow-moving inventory that ties up capital and warehouse space. Our analysis shows that inventory carrying costs increase exponentially after 30 days of storage.",
    impact: "Aging inventory represents tied-up capital, increased storage costs, and risk of obsolescence. Every day of reduced average inventory age typically translates to approximately $10,000 in freed-up working capital and reduced carrying costs.",
    recommendations: [
      "Above 30 days: Implement inventory reduction programs and review purchasing patterns",
      "20-30 days: Continue monitoring and optimize reorder points",
      "Below 20 days: Ensure service levels aren't compromised by too-lean inventory"
    ],
    benchmarks: "Industry average: 28 days | Best-in-class: 15 days"
  },
  "Orders on Hold": {
    title: "Orders on Hold",
    story: "Orders on Hold represents the count of customer orders that cannot be processed or shipped due to various issues such as credit holds, inventory shortages, quality concerns, or documentation problems. This metric is a leading indicator of potential customer satisfaction issues and cash flow delays.",
    impact: "Each held order represents delayed revenue, potential customer dissatisfaction, and additional administrative work. Our data shows that orders on hold for more than 3 days have a 35% higher chance of cancellation.",
    recommendations: [
      "Above 50: Immediate cross-functional review to address systemic issues",
      "20-50: Daily review process to clear holds and identify patterns",
      "Below 20: Maintain vigilance and continue prompt resolution processes"
    ],
    benchmarks: "Previous quarter average: 42 | Target: Below 25"
  },
  
  // Inbound Logistics Dashboard KPIs
  "ASN Accuracy": {
    title: "Advanced Shipping Notice Accuracy",
    story: "ASN Accuracy measures how well supplier-provided shipping notices match what is actually received. This includes accuracy of quantities, SKUs, lot numbers, and arrival times. High ASN accuracy enables better planning for receiving operations and downstream processes.",
    impact: "Inaccurate ASNs lead to receiving discrepancies, inventory inaccuracies, and labor inefficiencies. When ASNs are highly accurate, receiving operations can be optimized, and cross-docking becomes more feasible.",
    recommendations: [
      "Below 90%: Implement supplier education program and standardize ASN formats",
      "90-97%: Work with specific suppliers showing consistent issues",
      "Above 97%: Maintain performance and consider automated receiving processes"
    ],
    benchmarks: "Industry average: 92% | Best-in-class: 98%"
  },
  "In-Transit Inventory": {
    title: "In-Transit Inventory",
    story: "In-Transit Inventory represents the value and volume of goods that have been shipped by suppliers but not yet received at our facilities. This metric provides visibility into the supply pipeline and helps with resource planning for receiving operations.",
    impact: "High in-transit inventory levels can indicate supply chain disruptions or transportation delays. Optimizing this metric helps improve cash flow and reduces the risk of stockouts or production delays.",
    recommendations: [
      "Above target: Investigate transportation delays and consider expediting critical items",
      "At target: Maintain balance between transportation costs and inventory levels",
      "Below target: Evaluate if lean inventory practices are creating risk"
    ],
    benchmarks: "Target: 15% of total inventory value | Industry average: 18%"
  },
  "Shelf Life on Arrival": {
    title: "Shelf Life on Arrival",
    story: "Shelf Life on Arrival measures the remaining useful life of perishable or date-sensitive products when they arrive at our facilities. This is critical for industries like food, pharmaceuticals, or chemicals where product efficacy diminishes over time.",
    impact: "Products with short remaining shelf life have higher risk of obsolescence and may require expedited handling or discounting. Optimizing this metric reduces write-offs and improves inventory value.",
    recommendations: [
      "Below 70% of total shelf life: Review supplier production scheduling and transportation methods",
      "70-85% of total shelf life: Monitor specific product categories showing decline",
      "Above 85% of total shelf life: Maintain current processes and supplier agreements"
    ],
    benchmarks: "Target: >80% of total shelf life | Best-in-class: >90%"
  },
  "Inventory Ageing by Location": {
    title: "Inventory Ageing by Location",
    story: "This KPI tracks how long inventory has been stored at specific warehouse locations, helping identify slow-moving stock in particular areas. It provides more granular insight than overall inventory age by pinpointing where aging inventory problems exist.",
    impact: "Location-specific aging helps identify warehouse layout issues, picking inefficiencies, or FIFO/FEFO violations. Addressing these issues can improve space utilization and reduce carrying costs.",
    recommendations: [
      "Locations with >45 days average age: Consider relocation or layout changes",
      "Locations with 30-45 days average age: Review picking patterns and slotting",
      "Locations with <30 days average age: Maintain current processes"
    ],
    benchmarks: "Target: <25 days average per location | Industry average: 32 days"
  },
  "FEFO Compliance": {
    title: "First-Expire, First-Out Compliance",
    story: "FEFO Compliance measures how consistently the warehouse follows the First-Expire, First-Out principle when picking inventory. This ensures that items with the shortest remaining shelf life are used first, minimizing waste and obsolescence.",
    impact: "Poor FEFO compliance leads to increased write-offs, waste, and potential quality issues. High compliance reduces costs and ensures customers receive products with optimal remaining shelf life.",
    recommendations: [
      "Below 90%: Implement system controls and staff training on FEFO principles",
      "90-95%: Identify specific areas or processes with compliance issues",
      "Above 95%: Maintain current processes and consider automation enhancements"
    ],
    benchmarks: "Industry average: 92% | Best-in-class: 98%"
  },
  
  // Supplier Performance Dashboard KPIs
  "Order Accuracy": {
    title: "Supplier Order Accuracy",
    story: "Order Accuracy measures how precisely suppliers fulfill purchase orders according to specifications. This includes correct items, quantities, packaging, labeling, and documentation. It's a fundamental measure of supplier reliability and attention to detail.",
    impact: "Inaccurate orders create downstream inefficiencies including receiving delays, production disruptions, and quality issues. High accuracy reduces administrative burden and operational friction.",
    recommendations: [
      "Below 95%: Implement formal supplier corrective action process",
      "95-98%: Work with specific suppliers on targeted improvements",
      "Above 98%: Maintain performance through regular supplier reviews"
    ],
    benchmarks: "Industry average: 96% | Best-in-class: 99.5%"
  },
  "Damage Rate on Inbound": {
    title: "Damage Rate on Inbound",
    story: "This KPI tracks the percentage of items arriving with damage from suppliers. It encompasses both packaging damage that may affect product integrity and actual product damage. The metric helps evaluate supplier packaging quality and carrier handling.",
    impact: "Damaged inbound materials create inspection bottlenecks, returns processing costs, and potential production delays. Reducing damage rates improves throughput and reduces administrative costs.",
    recommendations: [
      "Above 2%: Review packaging specifications and carrier performance",
      "1-2%: Identify specific problem SKUs or suppliers for targeted improvement",
      "Below 1%: Maintain current packaging and handling protocols"
    ],
    benchmarks: "Industry average: 1.8% | Best-in-class: <0.5%"
  },
  "Communication Responsiveness": {
    title: "Communication Responsiveness",
    story: "This metric measures how quickly suppliers respond to inquiries, change requests, or issue notifications. It's calculated as the average time between outreach and meaningful response, and reflects a supplier's communication effectiveness.",
    impact: "Responsive suppliers help mitigate supply chain disruptions through early problem resolution. This metric correlates strongly with overall supplier relationship quality and collaboration potential.",
    recommendations: [
      "Above 24 hours: Establish clear communication protocols and escalation paths",
      "8-24 hours: Identify specific improvement opportunities with key suppliers",
      "Below 8 hours: Maintain relationships and consider as benchmark partners"
    ],
    benchmarks: "Industry average: 18 hours | Best-in-class: <4 hours"
  },
  "Inventory Carrying Efficiency": {
    title: "Inventory Carrying Efficiency",
    story: "This KPI measures how efficiently inventory from each supplier moves through our operations, calculated as inventory turns (annual cost of goods sold divided by average inventory value). It reflects both demand patterns and supplier delivery practices.",
    impact: "Higher inventory turns mean less working capital tied up in stock and lower carrying costs. Supplier-specific analysis helps identify opportunities for delivery frequency or lot size optimization.",
    recommendations: [
      "Below 8 turns: Review order quantities and delivery frequency",
      "8-12 turns: Fine-tune inventory parameters for specific SKUs",
      "Above 12 turns: Ensure service levels aren't at risk from lean inventory"
    ],
    benchmarks: "Industry average: 10 turns | Best-in-class: 15+ turns"
  },
  
  // Supply Chain Responsiveness Dashboard KPIs
  "Cycle Count Accuracy": {
    title: "Cycle Count Accuracy",
    story: "Cycle Count Accuracy measures the percentage match between physical inventory counts and system records. Regular cycle counting involves counting a subset of inventory on a rotating schedule rather than annual full counts. This KPI is critical for maintaining inventory integrity and financial reporting accuracy.",
    impact: "Low accuracy leads to stockouts, excess inventory, and production disruptions. Each percentage point improvement typically reduces expedited shipping costs by 3-5% and improves customer satisfaction scores.",
    recommendations: [
      "Below 95%: Implement root cause analysis and focused training programs",
      "95-98%: Refine cycle count procedures and frequency for problem areas",
      "Above 98%: Maintain procedures and consider reducing count frequency for stable items"
    ],
    benchmarks: "Industry average: 96% | Best-in-class: 99.5%"
  },
  "Replenishment Lead Time": {
    title: "Replenishment Lead Time",
    story: "Replenishment Lead Time measures the total days from when a replenishment need is identified until the inventory is received and available for use. This includes order processing, supplier production time, transportation, and receiving processes. It's a critical factor in setting safety stock levels and reorder points.",
    impact: "Extended lead times require higher safety stocks and earlier ordering, increasing working capital requirements. Each day of lead time reduction can decrease inventory carrying costs by approximately 1-2%.",
    recommendations: [
      "Above target: Review each stage of the process to identify bottlenecks",
      "At target: Maintain performance while exploring digital order processing",
      "Below target: Document process improvements and apply to other product categories"
    ],
    benchmarks: "Industry average: 18 days | Best-in-class: 10 days"
  },
  "Forecast Accuracy Feedback Loop": {
    title: "Forecast Accuracy Feedback Loop",
    story: "This KPI measures how accurately demand forecasts predict actual sales or shipments, typically calculated as 1 minus the Mean Absolute Percent Error (MAPE). It evaluates not just the accuracy but also how effectively forecast errors are analyzed and fed back into the forecasting process to drive continuous improvement.",
    impact: "Improved forecast accuracy directly reduces both stockouts and excess inventory. Studies show that each 5% improvement in forecast accuracy can reduce safety stock requirements by 7-10%.",
    recommendations: [
      "Below 70%: Implement structured forecast review meetings and root cause analysis",
      "70-85%: Focus on specific product categories or regions with lower accuracy",
      "Above 85%: Maintain current processes and consider advanced forecasting techniques"
    ],
    benchmarks: "Industry average: 75% | Best-in-class: 88%"
  },
  "Order Fulfillment Lead Time": {
    title: "Order Fulfillment Lead Time",
    story: "Order Fulfillment Lead Time measures the total elapsed time from when a customer places an order until it is delivered. This end-to-end metric encompasses order processing, picking, packing, shipping, and last-mile delivery. It's a key indicator of supply chain responsiveness and customer service.",
    impact: "Shorter lead times improve customer satisfaction and can be a competitive advantage. In many industries, customers are willing to pay a premium of 10-15% for significantly faster delivery.",
    recommendations: [
      "Above target: Map the entire process and identify bottlenecks for elimination",
      "At target: Maintain performance while exploring automation opportunities",
      "Below target: Consider offering premium delivery options at higher price points"
    ],
    benchmarks: "Industry average: 5.5 days | Best-in-class: 2 days"
  },
  
  // Traceability Dashboard KPIs
  "Batch & Lot Traceability": {
    title: "Batch & Lot Traceability",
    story: "This KPI measures the completeness and accuracy of product traceability data across the entire supply chain. Scored on a scale of 0-10, it evaluates how effectively we can trace a product from its raw material origins through manufacturing, distribution, and to the end customer. It includes factors like data completeness, system integration, and information accessibility.",
    impact: "Strong traceability reduces recall scope and costs, improves regulatory compliance, and builds consumer trust. Studies show that robust traceability can reduce recall costs by up to 90% by enabling precise identification of affected products.",
    recommendations: [
      "Score below 6: Implement standardized batch coding and digital documentation systems",
      "Score 6-8: Focus on integration gaps between supply chain partners",
      "Score above 8: Explore blockchain or distributed ledger solutions for end-to-end visibility"
    ],
    benchmarks: "Industry average: 6.5/10 | Best-in-class: 9+/10"
  },
  "Regulatory Hold Time": {
    title: "Regulatory Hold Time",
    story: "Regulatory Hold Time measures the average duration products spend in quality assurance holds across the supply chain. This includes time spent waiting for quality testing, documentation review, regulatory clearance, and resolution of compliance issues. It's a critical metric for regulated industries like food, pharmaceuticals, and medical devices.",
    impact: "Extended hold times increase inventory carrying costs and reduce product shelf life. For perishable goods, each day in hold can reduce sellable shelf life by 5-10% and increase spoilage risk.",
    recommendations: [
      "Above 48 hours: Implement parallel processing of regulatory documentation",
      "24-48 hours: Standardize testing protocols and invest in rapid testing equipment",
      "Below 24 hours: Maintain performance while exploring predictive analytics for hold risk"
    ],
    benchmarks: "Industry average: 36 hours | Best-in-class: 12 hours"
  },
  "Recall Readiness": {
    title: "Recall Readiness",
    story: "Recall Readiness measures the time required to identify, trace, and isolate potentially affected products in the event of a quality or safety issue. This metric is tested through regular mock recall exercises that simulate real-world scenarios and measure response time across the organization and supply chain partners.",
    impact: "Faster recall execution minimizes brand damage and regulatory penalties. Each hour reduction in recall time can save approximately $10,000-$50,000 in direct costs and significantly reduce consumer exposure.",
    recommendations: [
      "Above 24 hours: Implement dedicated recall management software and training",
      "12-24 hours: Conduct more frequent mock recalls with supply chain partners",
      "Below 12 hours: Maintain capabilities while exploring consumer-level traceability"
    ],
    benchmarks: "Industry average: 18 hours | Best-in-class: 4 hours"
  },
  "Non-Conformance Reports": {
    title: "Non-Conformance Reports",
    story: "This KPI tracks the number of quality issues identified and documented across the supply chain. Non-conformance reports (NCRs) capture instances where products or processes deviate from specifications, standards, or regulatory requirements. The metric includes both internal NCRs and those reported by customers or regulatory bodies.",
    impact: "High NCR rates indicate systemic quality issues that can lead to recalls, customer dissatisfaction, and regulatory scrutiny. Each NCR typically costs $2,000-$10,000 to investigate and resolve, not including potential rework or scrap costs.",
    recommendations: [
      "Increasing trend: Implement root cause analysis and corrective action processes",
      "Stable trend: Focus on preventive actions for most common NCR categories",
      "Decreasing trend: Document and standardize successful quality improvement initiatives"
    ],
    benchmarks: "Industry average: 2.5 NCRs per 1,000 units | Best-in-class: <0.5 NCRs per 1,000 units"
  },
  
  // 3PL Metrics Dashboard KPIs
  "Warehouse Utilization": {
    title: "Warehouse Utilization",
    story: "Warehouse Utilization measures the percentage of total available storage space that is currently being used. This includes all types of storage (floor, rack, shelf, etc.) and considers both cubic and square footage. It's calculated by dividing the space occupied by inventory by the total available storage space and multiplying by 100.",
    impact: "Optimizing warehouse utilization directly impacts operational costs and efficiency. Each 5% improvement in utilization can reduce storage costs by 3-7% while maintaining proper access and safety standards. Poor utilization often leads to inefficient operations and unnecessary expansion costs.",
    recommendations: [
      "Below 70%: Review slotting strategy and implement ABC inventory classification",
      "70-85%: Optimize pick paths and consider dynamic slotting solutions",
      "Above 85%: Monitor carefully as operational efficiency may decline; consider seasonal overflow strategies"
    ],
    benchmarks: "Industry average: 76% | Best-in-class: 85% (while maintaining operational efficiency)"
  },
  "Order Accuracy": {
    title: "Order Accuracy",
    story: "Order Accuracy measures the percentage of orders processed without errors throughout the entire fulfillment process. This includes picking, packing, and shipping accuracy. It's calculated by dividing the number of error-free orders by the total number of orders processed and multiplying by 100.",
    impact: "High order accuracy directly correlates with customer satisfaction and retention. Each percentage point improvement typically reduces returns processing costs by 10-15% and increases customer retention rates. Each error costs between $15-$70 to resolve, including shipping, processing, and customer service time.",
    recommendations: [
      "Below 97%: Implement barcode scanning and verification systems",
      "97-99%: Analyze error patterns and provide targeted training",
      "Above 99%: Maintain systems while exploring advanced technologies like voice picking or pick-to-light"
    ],
    benchmarks: "Industry average: 98.5% | Best-in-class: 99.8%"
  },
  "Picking Productivity": {
    title: "Picking Productivity",
    story: "Picking Productivity measures the average number of items or order lines picked per labor hour. This metric evaluates the efficiency of the warehouse picking operation, which typically accounts for 50-65% of total warehouse labor costs. It's influenced by warehouse layout, picking methods, technology, and staff training.",
    impact: "Improved picking productivity directly reduces labor costs and increases throughput capacity. Each 10% improvement in picking rates can reduce labor costs by 5-8% and increase order fulfillment capacity without additional staffing. This metric is critical for managing labor costs in 3PL operations.",
    recommendations: [
      "Below industry average: Review warehouse layout and implement ABC slotting",
      "At industry average: Consider batch picking or zone picking implementation",
      "Above industry average: Evaluate advanced technologies like voice picking or automation"
    ],
    benchmarks: "Industry average: 60-80 lines/hour | Best-in-class: 100+ lines/hour (method dependent)"
  },
  "Inventory Turnover": {
    title: "Inventory Turnover",
    story: "Inventory Turnover measures how many times inventory is sold or used in a given time period. It's calculated by dividing the cost of goods sold (COGS) by the average inventory value. For 3PLs, this metric helps evaluate how efficiently they're managing client inventory and warehouse space.",
    impact: "Higher turnover rates indicate more efficient inventory management and reduced carrying costs. Each point increase in turnover rate can reduce inventory carrying costs by 15-25%, freeing up capital and storage space. This metric helps identify slow-moving inventory that may require attention.",
    recommendations: [
      "Below 6 turns: Implement regular inventory analysis and obsolescence reviews",
      "6-12 turns: Fine-tune reorder points and safety stock levels",
      "Above 12 turns: Ensure service levels aren't compromised; consider JIT inventory strategies"
    ],
    benchmarks: "Industry average: 8 turns annually | Best-in-class: 15+ turns (industry dependent)"
  },
  "Dock to Stock Time": {
    title: "Dock to Stock Time",
    story: "Dock to Stock Time measures the average time elapsed from when goods arrive at the receiving dock until they are properly stored and available for picking in the warehouse management system. This includes unloading, inspection, labeling, putaway, and system updates.",
    impact: "Reducing dock to stock time improves inventory availability and warehouse throughput. Each hour reduction can increase same-day order fulfillment rates by 1-3% and reduce labor costs associated with receiving operations. Extended dock to stock times often create bottlenecks in the entire operation.",
    recommendations: [
      "Above 8 hours: Implement cross-docking for appropriate products and scheduled receiving windows",
      "4-8 hours: Optimize receiving processes with mobile scanning and directed putaway",
      "Below 4 hours: Maintain performance while exploring advanced receiving technologies"
    ],
    benchmarks: "Industry average: 6 hours | Best-in-class: 2 hours"
  }
};

export default kpiStories;
