const w = 1200;
const h = 500;
const padding = 60;

const svg = d3.select("#heatmap")
  .attr("width", w)
  .attr("height", h);

d3.json("global-temperature.json").then(data => {
  const baseTemp = data.baseTemperature;
  const monthlyData = data.monthlyVariance;

  const years = monthlyData.map(d => d.year);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const xScale = d3.scaleBand()
    .domain([...new Set(years)])
    .range([padding, w - padding]);

  const yScale = d3.scaleBand()
    .domain(d3.range(0, 12))
    .range([padding, h - padding]);

  const colorScale = d3.scaleQuantize()
    .domain(d3.extent(monthlyData, d => baseTemp + d.variance))
    .range(["#313695", "#4575b4", "#74add1", "#abd9e9", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]);

  svg.selectAll("rect")
    .data(monthlyData)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => baseTemp + d.variance)
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.month - 1))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", d => colorScale(baseTemp + d.variance))
    .on("mouseover", function(event, d) {
      const tooltip = d3.select("#tooltip");
      tooltip
        .style("visibility", "visible")
        .style("top", event.pageY + "px")
        .style("left", event.pageX + 10 + "px")
        .attr("data-year", d.year)
        .html(
          `${d.year} - ${months[d.month - 1]}<br/>
           Temp: ${(baseTemp + d.variance).toFixed(2)}℃<br/>
           Variance: ${d.variance.toFixed(2)}℃`
        );
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("visibility", "hidden");
    });

  const xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter(year => year % 10 === 0))
    .tickFormat(d3.format("d"));

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(month => months[month]);

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${h - padding})`)
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);
});
