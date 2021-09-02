use std::net::{IpAddr};
use trust_dns_resolver::Resolver;
use trust_dns_resolver::{config::*};
use tauri::command;

#[command]
pub fn dns_lookup_txt(hostname: String) -> Result<Vec<String>, String> {
  let resolver = Resolver::new(ResolverConfig::default(), ResolverOpts::default()).unwrap();
  let txt_response = resolver.txt_lookup(hostname);
  match txt_response {
    Err(_) => {
        Err("Could not find any TXT records!".into())
    },
    Ok(txt_response) => {
      let records = txt_response.iter().map(|record| record.to_string()).collect::<Vec<String>>();
      Ok(records)
    }
  }
}

#[command]
pub fn dns_lookup_reverse(ip_addr: String) -> Result<Vec<String>, String> {
  let resolver = Resolver::new(ResolverConfig::default(), ResolverOpts::default()).unwrap();
  let parse_result = ip_addr.parse::<IpAddr>();
  match parse_result {
    Err(_) => {
        Err("IP address could not be parsed!".into())
    },
    Ok(parsed_ip_addr) => {
      let reverse_response = resolver.reverse_lookup(parsed_ip_addr);
      match reverse_response {
        Err(_) => {
            Err("Reverse lookup failed!".into())
        },
        Ok(reverse_response) => {
          let records = reverse_response.iter().map(|record| record.to_string()).collect::<Vec<String>>();
          Ok(records)
        }
      }
    }
  }
}
