import type { Destination, PoolMember, RoutingRule, RuleCondition } from "@prisma/client";
import type { TrafficProfile, RouteResult } from "./types";

type RuleWithRelations = RoutingRule & {
  conditions: RuleCondition[];
  destination: Destination | null;
  pool: { id: string; name: string; members: (PoolMember & { destination: Destination })[] } | null;
};

export function evaluateCondition(
  condition: RuleCondition,
  profile: TrafficProfile,
): boolean {
  const fieldValue = getFieldValue(condition.field, profile);
  const target = condition.value;

  switch (condition.operator) {
    case "EQUALS":
      return fieldValue.toLowerCase() === target.toLowerCase();
    case "NOT_EQUALS":
      return fieldValue.toLowerCase() !== target.toLowerCase();
    case "CONTAINS":
      return fieldValue.toLowerCase().includes(target.toLowerCase());
    case "NOT_CONTAINS":
      return !fieldValue.toLowerCase().includes(target.toLowerCase());
    case "IN": {
      const values = target.split(",").map((v) => v.trim().toLowerCase());
      return values.includes(fieldValue.toLowerCase());
    }
    case "NOT_IN": {
      const values = target.split(",").map((v) => v.trim().toLowerCase());
      return !values.includes(fieldValue.toLowerCase());
    }
    case "REGEX":
      try {
        return new RegExp(target, "i").test(fieldValue);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function getFieldValue(field: RuleCondition["field"], profile: TrafficProfile): string {
  switch (field) {
    case "DEVICE_TYPE":
      return profile.deviceType;
    case "BROWSER":
      return profile.browser;
    case "OS":
      return profile.os;
    case "REFERRER":
      return profile.referrer;
    case "COUNTRY":
      return profile.country;
    case "LANGUAGE":
      return profile.language;
    case "USER_AGENT":
      return profile.userAgent;
    case "IS_FACEBOOK_INAPP":
      return profile.isFacebookInApp ? "true" : "false";
    case "IS_MOBILE":
      return profile.isMobile ? "true" : "false";
    default:
      return "";
  }
}

export function ruleMatches(rule: RuleWithRelations, profile: TrafficProfile): boolean {
  if (!rule.isActive || rule.conditions.length === 0) return false;
  return rule.conditions.every((condition) => evaluateCondition(condition, profile));
}

export function selectWeightedDestination(
  members: (PoolMember & { destination: Destination })[],
): Destination | null {
  const activeMembers = members.filter((m) => m.destination.isActive);
  if (activeMembers.length === 0) return null;

  const totalWeight = activeMembers.reduce((sum, m) => sum + m.weight, 0);
  let random = Math.random() * totalWeight;

  for (const member of activeMembers) {
    random -= member.weight;
    if (random <= 0) {
      return member.destination;
    }
  }

  return activeMembers[activeMembers.length - 1]?.destination ?? null;
}

export function resolveRoute(
  rules: RuleWithRelations[],
  profile: TrafficProfile,
  fallbackUrl: string,
): RouteResult {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    if (!ruleMatches(rule, profile)) continue;

    if (rule.pool) {
      const destination = selectWeightedDestination(rule.pool.members);
      if (destination) {
        return {
          action: destination.type === "INTERNAL" ? "SHOW" : "REDIRECT",
          destinationUrl: destination.url,
          destinationId: destination.id,
          ruleId: rule.id,
          ruleName: rule.name,
          poolId: rule.pool.id,
          poolName: rule.pool.name,
          reason: `Matched rule "${rule.name}" with weighted pool "${rule.pool.name}"`,
        };
      }
    }

    if (rule.destination) {
      return {
        action: rule.destination.type === "INTERNAL" ? "SHOW" : "REDIRECT",
        destinationUrl: rule.destination.url,
        destinationId: rule.destination.id,
        ruleId: rule.id,
        ruleName: rule.name,
        reason: `Matched rule "${rule.name}"`,
      };
    }
  }

  return {
    action: "SHOW",
    destinationUrl: fallbackUrl,
    reason: "No matching rule; using default landing page",
  };
}
