// Dimensions for the chart
const width = 800;
const height = 400;
const margin = { top: 20, right: 40, bottom: 50, left: 60 };

// Dimensions for the legend
const legendWidth = 200;
const legendHeight = 100;

// Create legend color scale
const color = d3
  .scaleOrdinal()
  .domain(["Riders with doping allegations", "No doping allegations"])
  .range(["#4285f4", "#ffa500 "]);

// Create a time formatter to format time values as minutes and seconds
const timeFormat = d3.timeFormat("%M:%S");


// Select the container for the chart
const svg = d3
  .select("#scatter-plot-graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data
d3.json(
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
)
  .then((data) => {
    // Data parsing
    data.forEach((d) => {
      d.Place = +d.Place;
      let parsedTime = d.Time.split(":");
      d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });

    // Create x scale
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.Year - 1),
        d3.max(data, (d) => d.Year + 1),
      ])
      .range([0, width]);

    // Create y scale
    const yScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Time))
      .range([0, height]);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    // Create y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

    // Define the div for the tooltip
    d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Append x-axis to SVG
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    // Append y-axis to SVG
    svg.append("g").attr("id", "y-axis").call(yAxis);

    // Append circles to SVG
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => yScale(d.Time))
      .attr("r", 6.5)
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => d.Time.toISOString()) // Set data-yvalue to the time duration
      .style("fill", (d) => color(d.Doping !== ""));

    // Create legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${width - legendWidth}, ${height - legendHeight - 275})`
      );

    // Add legend title
    legend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .text("Legend");

    // Add legend items
    const legendItems = legend
      .selectAll(".legend-item")
      .data(["Riders with doping allegations", "No doping allegations"])
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // Add legend color squares
    legendItems
      .append("rect")
      .attr("x", 5)
      .attr("y", 5)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", (d, i) => color(i));

    // Add legend labels
    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 5)
      .attr("dy", "0.7em")
      .text((d) => d);

    // Select the tooltip element
    const tooltip = d3.select("#tooltip");

    // Mouseover event handler
    const handleMouseOver = (event, d) => {
      // Extract information from the data point
      const name = d.Name;
      const nationality = d.Nationality;
      const year = d.Year;
      const time = timeFormat(d.Time);
      const dopingInfo = d.Doping ? `<br/><br/>${d.Doping}` : "";

      // Construct tooltip content
      const tooltipContent = `
        ${name}: ${nationality}<br/>
        Year: ${year}, Time: ${time}
        ${dopingInfo}
      `;

      // Show tooltip
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(tooltipContent)
        .attr("data-year", year) // Set data-year property
        .style("left", `${event.pageX + 15}px`)
        .style("top", `${event.pageY - 30}px`);
    };

    // Mouseout event handler
    const handleMouseOut = () => {
      // Hide tooltip
      tooltip.transition().duration(200).style("opacity", 0);
    };

    // Append mouseover and mouseout event listeners to your chart elements
    svg
      .selectAll(".dot")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  })
  .catch((error) => console.log("Error:", error));
