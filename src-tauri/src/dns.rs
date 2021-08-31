use trust_dns_resolver::Resolver;
use trust_dns_resolver::{config::*};
use tauri::command;

#[command]
pub fn dns_lookup_txt(hostname: String) -> Result<Vec<String>, String> {
  let resolver = Resolver::new(ResolverConfig::default(), ResolverOpts::default()).unwrap();
  println!("Looking up: {}", hostname);
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
