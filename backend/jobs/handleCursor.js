module.exports = async function handleCursor(cursor, bucket, query) {
  if (query) {
    const { title, beginDays, endDays, tresholdDays, idProp, urlProp } = query;
    const titleLogs = [];

    if (beginDays >= 0 && endDays >= 0 && tresholdDays >= 0) {
      titleLogs.push(`from ${beginDays} - ${endDays} days`);
      titleLogs.push(`threshold ${tresholdDays} days`);
    } else if (idProp) {
      titleLogs.push(idProp);
    } else if (urlProp) {
      titleLogs.push(urlProp);
    }

    console.log(`========== ${title}: ${titleLogs.join(', ')}`);
  }

  await cursor.forEach((g) => {
    if (query) {
      const { updatedProp } = query;
      const cursorLogs = [];
      cursorLogs.push(`${g.name}`);

      const released = new Date(g.released);
      const releasedDifference = Math.floor((Date.now() - g.released) / (1000 * 60 * 60 * 24));
      cursorLogs.push(`Released: ${released.toLocaleDateString()} (${releasedDifference} days ago)`);

      if (g[updatedProp]) {
        const updated = new Date(g[updatedProp]);
        const updatedDifference = Math.floor((Date.now() - g[updatedProp]) / (1000 * 60 * 60 * 24));
        cursorLogs.push(`Updated: ${updated.toLocaleDateString()} (${updatedDifference} days ago)`);
      } else {
        cursorLogs.push('Updated: never');
      }

      console.log(cursorLogs.join(', '));
    }

    bucket.push(g);
  });

  return bucket;
};
