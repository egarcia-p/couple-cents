const options = {
  scales: {
    y: {
      ticks: {
        // Include a dollar sign in the ticks
        callback: function (value: any, index: any, ticks: any): string {
          //return "$" + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
          }).format(value);
        },
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || "";

          if (label) {
            label += ": ";
          }
          const value = context.parsed.y ?? context.parsed;
          if (value !== null && value !== undefined) {
            label += new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(value);
          }
          return label;
        },
      },
    },
  },
};
export default options;
