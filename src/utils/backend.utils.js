export const message = (th, en) => ({
  message: {
    th,
    en,
  },
});

export const toPlain = (value) => {
  if (!value) return value;
  if (typeof value.get === "function") {
    return value.get({ plain: true });
  }
  if (value.dataValues) return value.dataValues;
  return value;
};

export const toNumber = (value) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

export const parsePositiveAmount = (value) => {
  const amount = toNumber(value);
  return amount > 0 ? amount : null;
};

export const addBillingInterval = (startDate, interval, count = 1) => {
  const result = new Date(startDate);
  const normalizedCount = Number(count) > 0 ? Number(count) : 1;

  switch (interval) {
    case "DAY":
      result.setDate(result.getDate() + normalizedCount);
      break;
    case "WEEK":
      result.setDate(result.getDate() + normalizedCount * 7);
      break;
    case "YEAR":
      result.setFullYear(result.getFullYear() + normalizedCount);
      break;
    case "MONTH":
    default:
      result.setMonth(result.getMonth() + normalizedCount);
      break;
  }

  return result;
};

export const sortByCreatedAtDesc = (items) =>
  [...items].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );

export const formatPayment = ({
  id,
  title,
  reference_table,
  reference_id,
  amount,
  payment_status,
  created_at,
  type,
  slip_image_url,
  payment_method,
}) => ({
  id,
  payment_id: id,
  type,
  title,
  package_title: title,
  reference_table,
  reference_id,
  reference: reference_id || id,
  amount: toNumber(amount),
  price: toNumber(amount),
  total: toNumber(amount),
  value: toNumber(amount),
  payment_status,
  status: payment_status,
  payment_method,
  slip_image_url,
  created_at,
});
